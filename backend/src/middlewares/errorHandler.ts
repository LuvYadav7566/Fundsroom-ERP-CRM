import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('💥 Error Caught in Middleware:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(res, `Conflict error: A record with this ${field} already exists.`, 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Requested database record not found.', 404);
    }
  }

  const message = err.message || 'An unexpected internal server error occurred.';
  return sendError(res, message, 500);
};
