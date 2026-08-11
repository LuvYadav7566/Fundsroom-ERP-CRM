import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challanService';
import { sendSuccess } from '../utils/apiResponse';

export class ChallanController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, customerId, page, limit } = req.query;
      const result = await ChallanService.getChallans({
        search: search as string,
        status: status as string,
        customerId: customerId as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(
        res,
        result.challans,
        'Sales challans list retrieved successfully.',
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, challan, 'Sales challan details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async createDraftChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, items } = req.body;
      const userId = req.user!.id;
      const challan = await ChallanService.createDraftChallan(customerId, items, userId);
      return sendSuccess(res, challan, 'Draft sales challan created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const challan = await ChallanService.confirmChallan(id, userId);
      return sendSuccess(res, challan, `Sales challan '${challan.challanNumber}' confirmed successfully. Stock deducted.`);
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const challan = await ChallanService.cancelChallan(id, userId);
      return sendSuccess(res, challan, `Sales challan '${challan.challanNumber}' marked as CANCELLED.`);
    } catch (error) {
      next(error);
    }
  }
}
