import { prisma } from '../config/db';
import { Role } from '../types/express';

export class DashboardService {
  static async getStats(userRole: Role) {
    // 1. Core Summary Metrics
    const [
      totalCustomers,
      totalProducts,
      rawProducts,
      draftChallansCount,
      confirmedChallansCount,
      cancelledChallansCount,
      confirmedChallansWithItems,
      recentChallans,
      recentStockMovements,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.findMany(),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.challan.count({ where: { status: 'CANCELLED' } }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED' },
        include: { items: true },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerName: true, businessName: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { productName: true, sku: true } },
          user: { select: { name: true } },
        },
      }),
    ]);

    // Calculate total stock units and low stock count
    const totalStockUnits = rawProducts.reduce((sum, p) => sum + p.currentStock, 0);
    const lowStockProductsCount = rawProducts.filter((p) => p.currentStock <= p.minimumStock).length;

    // Calculate Total Revenue from Confirmed Challans
    const totalRevenueConfirmed = confirmedChallansWithItems.reduce((acc, c) => {
      const challanTotal = c.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
      return acc + challanTotal;
    }, 0);

    // 2. Category Inventory Breakdown for Recharts
    const categoryMap = new Map<string, { category: string; stock: number; productCount: number }>();
    for (const p of rawProducts) {
      const existing = categoryMap.get(p.category) || { category: p.category, stock: 0, productCount: 0 };
      categoryMap.set(p.category, {
        category: p.category,
        stock: existing.stock + p.currentStock,
        productCount: existing.productCount + 1,
      });
    }
    const inventoryCategoryBreakdown = Array.from(categoryMap.values());

    // 3. Challans Status Distribution for Recharts
    const challanStatusBreakdown = [
      { name: 'Confirmed', count: confirmedChallansCount, color: '#16A34A' },
      { name: 'Draft', count: draftChallansCount, color: '#F59E0B' },
      { name: 'Cancelled', count: cancelledChallansCount, color: '#DC2626' },
    ];

    // 4. Role-Specific Tailored Metrics & Highlights
    let roleFocusNotice = '';
    if (userRole === 'ADMIN') {
      roleFocusNotice = 'Executive Overview: Showing full operational visibility across CRM, Inventory, and Sales.';
    } else if (userRole === 'SALES') {
      roleFocusNotice = `Sales Portal: ${draftChallansCount} draft challans pending confirmation. Check follow-ups scheduled today.`;
    } else if (userRole === 'WAREHOUSE') {
      roleFocusNotice = `Warehouse Alert: ${lowStockProductsCount} items currently below minimum stock threshold requiring inward procurement.`;
    } else if (userRole === 'ACCOUNTS') {
      roleFocusNotice = `Accounts Summary: Total confirmed revenue standing at ₹${totalRevenueConfirmed.toLocaleString('en-IN')}.`;
    }

    return {
      metrics: {
        totalCustomers,
        totalProducts,
        totalStockUnits,
        lowStockProductsCount,
        draftChallansCount,
        confirmedChallansCount,
        cancelledChallansCount,
        totalRevenueConfirmed,
      },
      visualizations: {
        inventoryCategoryBreakdown,
        challanStatusBreakdown,
      },
      recentActivity: {
        recentChallans,
        recentStockMovements,
      },
      roleFocusNotice,
    };
  }
}
