import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { sendSuccess } from '../utils/apiResponse';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, lowStock, page, limit } = req.query;
      const result = await ProductService.getProducts({
        search: search as string,
        category: category as string,
        lowStock: lowStock === 'true',
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(
        res,
        result.products,
        'Products list retrieved successfully.',
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, product, 'Product details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      return sendSuccess(res, product, 'Product created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);
      return sendSuccess(res, product, 'Product updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}
