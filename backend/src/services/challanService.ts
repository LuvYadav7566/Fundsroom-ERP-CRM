import { prisma } from '../config/db';
import { AppError } from '../utils/errors';
import { generateChallanNumber } from '../utils/challanNumberGenerator';

export interface ChallanQueryFilter {
  search?: string;
  status?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface ChallanItemInput {
  productId: string;
  quantity: number;
}

export class ChallanService {
  static async getChallans(params: ChallanQueryFilter) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { challanNumber: { contains: q } },
        { customer: { customerName: { contains: q } } },
        { customer: { businessName: { contains: q } } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [total, rawChallans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              businessName: true,
              mobile: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          items: true,
        },
      }),
    ]);

    const challans = rawChallans.map((c) => {
      const totalAmount = c.items.reduce((sum, item) => sum + item.totalPrice, 0);
      return {
        ...c,
        totalAmount,
      };
    });

    return {
      challans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                sku: true,
                currentStock: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });

    if (!challan) {
      throw new AppError('Sales Challan record not found.', 404);
    }

    const totalAmount = challan.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      ...challan,
      totalAmount,
    };
  }

  static async createDraftChallan(
    customerId: string,
    itemsInput: ChallanItemInput[],
    userId: string
  ) {
    // 1. Verify Customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new AppError('Selected customer does not exist.', 404);
    }

    // 2. Fetch Products to capture snapshot information
    const productIds = itemsInput.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let calculatedTotalQuantity = 0;
    const challanItemsData = [];

    for (const item of itemsInput) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(`Product ID '${item.productId}' not found in inventory.`, 404);
      }
      if (item.quantity <= 0) {
        throw new AppError(`Quantity for product '${product.productName}' must be greater than zero.`, 400);
      }

      calculatedTotalQuantity += item.quantity;
      const totalPrice = product.unitPrice * item.quantity;

      challanItemsData.push({
        productId: product.id,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        totalPrice,
      });
    }

    const challanNumber = await generateChallanNumber();

    const createdChallan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity: calculatedTotalQuantity,
        status: 'DRAFT',
        createdBy: userId,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return createdChallan;
  }

  static async confirmChallan(id: string, userId: string) {
    // Perform entire confirmation workflow in a strict database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Challan with items and product records
      const challan = await tx.challan.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });

      if (!challan) {
        throw new AppError('Challan not found for confirmation.', 404);
      }

      if (challan.status !== 'DRAFT') {
        throw new AppError(
          `Cannot confirm challan '${challan.challanNumber}' because its current status is '${challan.status}'.`,
          400
        );
      }

      // 2. Validate Stock Availability for ALL items first
      for (const item of challan.items) {
        const product = item.product;
        if (!product) {
          throw new AppError(`Product record missing for snapshot '${item.productNameSnapshot}'.`, 404);
        }

        if (product.currentStock < item.quantity) {
          // EXPLICIT INSUFFICIENT STOCK ERROR -> ABORTS & ROLLS BACK ENTIRE TRANSACTION
          throw new AppError(
            `Insufficient stock for product ${product.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`,
            400
          );
        }
      }

      // 3. Stock is sufficient -> Decrement stock & Log OUT stock movement for each item
      for (const item of challan.items) {
        // Atomic stock decrement
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        // Create Outward Stock Movement Log
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan Confirmation: ${challan.challanNumber}`,
            createdBy: userId,
          },
        });
      }

      // 4. Update Challan status to CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
        },
        include: {
          customer: true,
          items: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });

      return confirmedChallan;
    });

    return result;
  }

  static async cancelChallan(id: string, userId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new AppError('Challan not found for cancellation.', 404);
      }

      if (challan.status === 'CANCELLED') {
        throw new AppError('Challan is already cancelled.', 400);
      }

      // If previously CONFIRMED, restore inventory and log inward stock movement
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'IN',
              reason: `Sales Challan Cancellation Reversal: ${challan.challanNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      const cancelledChallan = await tx.challan.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          customer: true,
          items: true,
        },
      });

      return cancelledChallan;
    });

    return result;
  }
}
