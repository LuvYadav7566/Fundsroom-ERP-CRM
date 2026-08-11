export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  challans?: Challan[];
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: {
    productName: string;
    sku: string;
    category?: string;
    unitPrice?: number;
    currentStock?: number;
    minimumStock?: number;
  };
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  createdAt: string;
}

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
  product?: Product;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  totalQuantity: number;
  totalAmount?: number;
  status: ChallanStatus;
  createdBy: string;
  user?: {
    id?: string;
    name: string;
    email: string;
    role?: Role;
  };
  items: ChallanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errors?: any;
}

export interface DashboardStats {
  metrics: {
    totalCustomers: number;
    totalProducts: number;
    totalStockUnits: number;
    lowStockProductsCount: number;
    draftChallansCount: number;
    confirmedChallansCount: number;
    cancelledChallansCount: number;
    totalRevenueConfirmed: number;
  };
  visualizations: {
    inventoryCategoryBreakdown: { category: string; stock: number; productCount: number }[];
    challanStatusBreakdown: { name: string; count: number; color: string }[];
  };
  recentActivity: {
    recentChallans: Challan[];
    recentStockMovements: StockMovement[];
  };
  roleFocusNotice: string;
}
