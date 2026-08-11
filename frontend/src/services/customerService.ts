import { api } from './api';
import { ApiResponse, Customer } from '../types';

export const customerService = {
  getCustomers: async (params?: {
    search?: string;
    status?: string;
    customerType?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },
};
