'use server'


import Sale from '@/lib/models/sales.models';
import Product from '@/lib/models/product.models';
import Customer from '@/lib/models/customer.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { connectToDB } from '../mongoose';

export async function createSaleOrder(orderData: {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
}) {
  try {
    await connectToDB();
    
    const sale = await Sale.create({
      warehouse: '507f1f77bcf86cd799439011',
      items: orderData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      })),
      customer: orderData.customerId,
      paymentMethod: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      tax: orderData.tax,
      totalRevenue: orderData.total,
      notes: orderData.notes,
      saleDate: new Date()
    });

    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to create sale order');
  }
}

export async function getAllSales(filters?: {
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  paymentMethod?: string;
  status?: string;
}) {
  try {
    await connectToDB();
    
    let query: any = { isVoided: { $ne: true } };
    
    if (filters?.startDate && filters?.endDate) {
      query.saleDate = { $gte: filters.startDate, $lte: filters.endDate };
    }
    
    if (filters?.customerId) {
      query.customer = filters.customerId;
    }
    
    if (filters?.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }
    
    const sales = await Sale.find(query)
      .populate('items.product', 'name sku')
      .populate('customer', 'name email phone')
      .sort({ saleDate: -1 })
      .limit(100);
    
    return JSON.parse(JSON.stringify(sales));
  } catch (error) {
    throw new Error('Failed to fetch sales');
  }
}

export async function getSaleById(saleId: string) {
  try {
    await connectToDB();
    
    const sale = await Sale.findById(saleId)
      .populate('items.product', 'name sku price')
      .populate('customer', 'name email phone loyaltyPoints');
    
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to fetch sale details');
  }
}

export async function updateSaleOrder(saleId: string, updateData: {
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    await connectToDB();
    
    const updateFields: any = {};
    
    if (updateData.items) {
      updateFields.items = updateData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));
      
      const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      updateFields.subtotal = subtotal;
      updateFields.totalRevenue = subtotal;
    }
    
    if (updateData.paymentMethod) {
      updateFields.paymentMethod = updateData.paymentMethod;
    }
    
    if (updateData.notes) {
      updateFields.notes = updateData.notes;
    }
    
    const sale = await Sale.findByIdAndUpdate(saleId, updateFields, { new: true })
      .populate('items.product', 'name sku price')
      .populate('customer', 'name email phone');
    
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to update sale order');
  }
}

export async function deleteSaleOrder(saleId: string) {
  try {
    await connectToDB();
    
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      { isVoided: true, voidedAt: new Date() },
      { new: true }
    );
    
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete sale order');
  }
}

export async function getSalesStats() {
  try {
    await connectToDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [todaySales, monthSales, totalSales] = await Promise.all([
      Sale.find({ saleDate: { $gte: today, $lt: tomorrow }, isVoided: { $ne: true } }),
      Sale.find({ saleDate: { $gte: thisMonth }, isVoided: { $ne: true } }),
      Sale.find({ isVoided: { $ne: true } })
    ]);
    
    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const totalRevenue = totalSales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    
    return {
      todayRevenue,
      todayOrders: todaySales.length,
      monthRevenue,
      monthOrders: monthSales.length,
      totalRevenue,
      totalOrders: totalSales.length,
      avgOrderValue: totalSales.length > 0 ? totalRevenue / totalSales.length : 0
    };
  } catch (error) {
    throw new Error('Failed to fetch sales stats');
  }
}

export async function importSalesData(salesData: Array<{
  customerEmail?: string;
  items: Array<{
    productSku: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod: string;
  saleDate: string;
  notes?: string;
}>) {
  try {
    await connectToDB();
    
    const results = [];
    
    for (const saleData of salesData) {
      try {
        let customerId = null;
        if (saleData.customerEmail) {
          const customer = await Customer.findOne({ email: saleData.customerEmail });
          customerId = customer?._id;
        }
        
        const processedItems = [];
        let subtotal = 0;
        
        for (const item of saleData.items) {
          const product = await Product.findOne({ sku: item.productSku });
          if (product) {
            const itemTotal = item.quantity * item.unitPrice;
            processedItems.push({
              product: product._id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: itemTotal
            });
            subtotal += itemTotal;
          }
        }
        
        if (processedItems.length > 0) {
          const sale = await Sale.create({
            warehouse: '507f1f77bcf86cd799439011',
            items: processedItems,
            customer: customerId,
            paymentMethod: saleData.paymentMethod,
            subtotal,
            totalRevenue: subtotal,
            notes: saleData.notes,
            saleDate: new Date(saleData.saleDate)
          });
          
          results.push({ success: true, saleId: sale._id });
        } else {
          results.push({ success: false, error: 'No valid products found' });
        }
      } catch (error) {
        results.push({ success: false, error: 'Failed to process sale' });
      }
    }
    
    return results;
  } catch (error) {
    throw new Error('Failed to import sales data');
  }
}