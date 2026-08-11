import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';
import { sendSuccess } from '../utils/apiResponse';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, customerType, page, limit } = req.query;
      const result = await CustomerService.getCustomers({
        search: search as string,
        status: status as string,
        customerType: customerType as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(
        res,
        result.customers,
        'Customers list retrieved successfully.',
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      return sendSuccess(res, customer, 'Customer details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return sendSuccess(res, customer, 'Customer created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.updateCustomer(id, req.body);
      return sendSuccess(res, customer, 'Customer updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}
