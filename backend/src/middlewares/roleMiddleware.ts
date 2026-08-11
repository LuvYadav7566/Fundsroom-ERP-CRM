import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { Role } from '../types/express';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user context.', 401);
    }

    // Admin has universal permission across all endpoints
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`,
        403
      );
    }

    next();
  };
};
