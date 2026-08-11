import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export interface CustomerQueryFilter {
  search?: string;
  status?: string;
  customerType?: string;
  page?: number;
  limit?: number;
}

export class CustomerService {
  static async getCustomers(params: CustomerQueryFilter) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { customerName: { contains: q } },
        { businessName: { contains: q } },
        { mobile: { contains: q } },
        { email: { contains: q } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerType) {
      where.customerType = params.customerType;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer record not found.', 404);
    }

    return customer;
  }

  static async createCustomer(data: any) {
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [{ email: data.email }, { mobile: data.mobile }],
      },
    });

    if (existing) {
      throw new AppError('Customer with this email or mobile number already exists.', 409);
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    return customer;
  }

  static async updateCustomer(id: string, data: any) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError('Customer not found for update.', 404);
    }

    const updateData = { ...data };
    if (data.followUpDate !== undefined) {
      updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }
}
