import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { sendSuccess } from '../utils/apiResponse';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user!.role;
      const stats = await DashboardService.getStats(userRole);
      return sendSuccess(res, stats, 'Dashboard operational metrics fetched successfully.');
    } catch (error) {
      next(error);
    }
  }
}
