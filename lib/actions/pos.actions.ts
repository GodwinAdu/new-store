'use server'


import Product from '@/lib/models/product.models';
import Sale from '@/lib/models/sales.models';
import Customer from '@/lib/models/customer.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { connectToDB } from '../mongoose';

export async function getProducts(category?: string, search?: string) {
  try {
    await connectToDB();

    let query: any = { del_flag: false, isActive: true };
    
    if (category && category !== 'All') {
      const Category = await import('@/lib/models/category.models').then(m => m.default);
      const cat = await Category.findOne({ name: category });
      if (cat) query.categoryId = cat._id;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .limit(50);
    
    // Get stock levels from batches
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const batches = await ProductBatch.find({
          product: product._id,
          isDepleted: false,
          remaining: { $gt: 0 }
        });
        
        const totalStock = batches.reduce((sum, batch) => sum + batch.remaining, 0);
        const avgPrice = batches.length > 0 
          ? batches.reduce((sum, batch) => sum + batch.sellingPrice, 0) / batches.length
          : 0;
        
        return {
          id: product._id.toString(),
          name: product.name,
          price: avgPrice,
          category: product.categoryId?.name || 'Uncategorized',
          stock: totalStock,
          barcode: product.barcode,
          sku: product.sku,
          isPopular: totalStock > 50
        };
      })
    );
    
    return productsWithStock;
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
}

export async function processSale(saleData: {
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  customerId?: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cashReceived?: number;
}) {
  try {
    await connectToDatabase();
    
    // Create sale record
    const sale = await Sale.create({
      warehouse: '507f1f77bcf86cd799439011', // Default warehouse
      items: saleData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      saleDate: new Date(),
      paymentMethod: saleData.paymentMethod,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      total: saleData.total,
      cashReceived: saleData.cashReceived
    });
    
    // Update customer if provided
    if (saleData.customerId) {
      const pointsEarned = Math.floor(saleData.total);
      await Customer.findByIdAndUpdate(saleData.customerId, {
        $inc: { 
          loyaltyPoints: pointsEarned,
          totalSpent: saleData.total,
          totalOrders: 1
        },
        lastVisit: new Date()
      });
    }
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to process sale');
  }
}

export async function getTodayStats() {
  try {
    await connectToDatabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sales = await Sale.find({
      saleDate: { $gte: today, $lt: tomorrow }
    });
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const totalTransactions = sales.length;
    const avgOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Get hourly breakdown
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 9; // 9AM to 8PM
      const hourSales = sales.filter(sale => {
        const saleHour = new Date(sale.saleDate).getHours();
        return saleHour === hour;
      });
      
      return {
        hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
        sales: hourSales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0),
        transactions: hourSales.length
      };
    });
    
    const peakHour = hourlyData.reduce((max, current) => 
      current.transactions > max.transactions ? current : max
    );
    
    return {
      totalSales,
      totalTransactions,
      avgOrderValue,
      peakHour: peakHour.hour,
      hourlyData
    };
  } catch (error) {
    throw new Error('Failed to fetch today stats');
  }
}