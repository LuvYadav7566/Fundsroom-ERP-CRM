import { api } from './api';
import { ApiResponse, StockMovement } from '../types';

export const stockService = {
  getMovements: async (params?: {
    productId?: string;
    movementType?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<ApiResponse<StockMovement[]>>('/stock/movements', { params });
    return res.data;
  },

  addStockIn: async (data: { productId: string; quantity: number; reason: string }) => {
    const res = await api.post<ApiResponse<any>>('/stock/in', data);
    return res.data.data;
  },
};
