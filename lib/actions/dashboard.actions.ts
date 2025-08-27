'use server'


import Sale from '@/lib/models/sales.models';
import Product from '@/lib/models/product.models';
import Customer from '@/lib/models/customer.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { connectToDB } from '../mongoose';

export async function getDashboardStats() {
  try {
    await connectToDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Today's sales
    const todaySales = await Sale.find({
      saleDate: { $gte: today, $lt: tomorrow },
      isVoided: { $ne: true }
    });

    // Yesterday's sales
    const yesterdaySales = await Sale.find({
      saleDate: { $gte: yesterday, $lt: today },
      isVoided: { $ne: true }
    });

    // This month's sales
    const thisMonthSales = await Sale.find({
      saleDate: { $gte: thisMonth },
      isVoided: { $ne: true }
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const monthRevenue = thisMonthSales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);

    // Product stats
    const totalProducts = await Product.countDocuments({ del_flag: false, isActive: true });
    const lowStockProducts = await ProductBatch.aggregate([
      { $match: { isDepleted: false } },
      { $group: { _id: '$product', totalStock: { $sum: '$remaining' } } },
      { $match: { totalStock: { $lte: 10 } } },
      { $count: 'count' }
    ]);

    // Customer stats
    const totalCustomers = await Customer.countDocuments({ del_flag: false, isActive: true });
    const newCustomersToday = await Customer.countDocuments({
      createdAt: { $gte: today },
      del_flag: false
    });

    // Top products
    const topProducts = await Sale.aggregate([
      { $match: { saleDate: { $gte: thisMonth }, isVoided: { $ne: true } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: '$product.name',
          quantity: '$totalQuantity',
          revenue: '$totalRevenue'
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Sale.find({
      isVoided: { $ne: true }
    })
      .populate('items.product', 'name')
      .sort({ saleDate: -1 })
      .limit(5);

    return {
      todayRevenue,
      yesterdayRevenue,
      monthRevenue,
      todayTransactions: todaySales.length,
      yesterdayTransactions: yesterdaySales.length,
      totalProducts,
      lowStockCount: lowStockProducts[0]?.count || 0,
      totalCustomers,
      newCustomersToday,
      topProducts,
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        date: order.saleDate,
        items: order.items.length,
        total: order.totalRevenue || 0,
        paymentMethod: order.paymentMethod
      }))
    };
  } catch (error) {
    throw new Error('Failed to fetch dashboard stats');
  }
}

export async function getRevenueChart() {
  try {
    await connectToDB();

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const chartData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const sales = await Sale.find({
          saleDate: { $gte: date, $lt: nextDay },
          isVoided: { $ne: true }
        });

        const revenue = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);

        return {
          date: date.toISOString().split('T')[0],
          revenue,
          transactions: sales.length
        };
      })
    );

    return chartData;
  } catch (error) {
    throw new Error('Failed to fetch revenue chart data');
  }
}