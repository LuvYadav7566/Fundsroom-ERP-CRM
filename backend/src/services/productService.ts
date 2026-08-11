import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export interface ProductQueryFilter {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  static async getProducts(params: ProductQueryFilter) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { productName: { contains: q } },
        { sku: { contains: q } },
        { category: { contains: q } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    const [total, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const products = rawProducts.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minimumStock,
    }));

    const filteredProducts = params.lowStock
      ? products.filter((p) => p.isLowStock)
      : products;

    return {
      products: filteredProducts,
      meta: {
        page,
        limit,
        total: params.lowStock ? filteredProducts.length : total,
        totalPages: Math.ceil((params.lowStock ? filteredProducts.length : total) / limit) || 1,
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minimumStock,
    };
  }

  static async createProduct(data: any) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase().trim() },
    });

    if (existingSku) {
      throw new AppError(`Product with SKU '${data.sku}' already exists.`, 409);
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        sku: data.sku.toUpperCase().trim(),
      },
    });

    return product;
  }

  static async updateProduct(id: string, data: any) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError('Product not found for update.', 404);
    }

    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku.toUpperCase().trim() },
      });
      if (existing) {
        throw new AppError(`Product with SKU '${data.sku}' already exists.`, 409);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.sku ? { sku: data.sku.toUpperCase().trim() } : {}),
      },
    });

    return updated;
  }
}
