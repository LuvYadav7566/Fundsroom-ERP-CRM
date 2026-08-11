import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stockService';
import { sendSuccess } from '../utils/apiResponse';

export class StockController {
  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, movementType, page, limit } = req.query;
      const result = await StockService.getMovements({
        productId: productId as string,
        movementType: movementType as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(
        res,
        result.movements,
        'Stock movements log retrieved successfully.',
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async addStockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, reason } = req.body;
      const userId = req.user!.id;
      const result = await StockService.addStockIn(productId, quantity, reason, userId);

      return sendSuccess(res, result, 'Stock inward added successfully.', 201);
    } catch (error) {
      next(error);
    }
  }
}
