import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export interface StockMovementQueryFilter {
  productId?: string;
  movementType?: string;
  page?: number;
  limit?: number;
}

export class StockService {
  static async getMovements(params: StockMovementQueryFilter) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.movementType) {
      where.movementType = params.movementType;
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              productName: true,
              sku: true,
              category: true,
              unitPrice: true,
              currentStock: true,
              minimumStock: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      movements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async addStockIn(
    productId: string,
    quantity: number,
    reason: string,
    userId: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found for stock entry.', 404);
    }

    if (quantity <= 0) {
      throw new AppError('Inward stock quantity must be greater than zero.', 400);
    }

    // Execute in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            increment: quantity,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType: 'IN',
          reason,
          createdBy: userId,
        },
        include: {
          product: {
            select: {
              productName: true,
              sku: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return { product: updatedProduct, movement };
    });

    return result;
  }
}
