'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Eye, Edit, Trash2, Package, Truck, ShoppingCart, Download } from 'lucide-react';
import Link from 'next/link';
import { getAllPurchases, getPurchaseById, deletePurchaseOrder, updatePurchaseOrder, receivePurchaseOrder } from '@/lib/actions/purchase-dashboard.actions';

interface Purchase {
  _id: string;
  supplier: {
    name: string;
    email: string;
    phone: string;
  };
  orderType: string;
  status: string;
  totalCost: number;
  orderDate: string;
  receivedDate?: string;
  items: Array<{
    product: {
      name: string;
      sku: string;
    };
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  transportDetails?: {
    carrier: string;
    trackingNumber?: string;
    shippingCost: number;
  };
  wholesaleDetails?: {
    bulkDiscount: number;
    minimumQuantity: number;
  };
  notes?: string;
}

export default function ListPurchaseOrders() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, searchTerm, statusFilter, typeFilter]);

  const loadPurchases = async () => {
    try {
      const data = await getAllPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPurchases = () => {
    let filtered = purchases;

    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.orderType === typeFilter);
    }

    setFilteredPurchases(filtered);
  };

  const handleViewDetails = async (purchaseId: string) => {
    try {
      const purchase = await getPurchaseById(purchaseId);
      setSelectedPurchase(purchase);
    } catch (error) {
      console.error('Failed to load purchase details:', error);
    }
  };

  const handleStatusUpdate = async (purchaseId: string, newStatus: string) => {
    try {
      await updatePurchaseOrder(purchaseId, { status: newStatus });
      loadPurchases();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleReceiveOrder = async (purchaseId: string) => {
    try {
      const purchase = purchases.find(p => p._id === purchaseId);
      if (purchase) {
        const receivedItems = purchase.items.map(item => ({
          productId: item.product._id || '',
          receivedQuantity: item.quantity
        }));
        await receivePurchaseOrder(purchaseId, receivedItems);
        loadPurchases();
      }
    } catch (error) {
      console.error('Failed to receive order:', error);
    }
  };

  const handleDelete = async (purchaseId: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await deletePurchaseOrder(purchaseId);
        loadPurchases();
      } catch (error) {
        console.error('Failed to delete purchase:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'transport': return <Truck className="h-4 w-4" />;
      case 'wholesale': return <Package className="h-4 w-4" />;
      default: return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Order ID', 'Supplier', 'Type', 'Status', 'Total Cost', 'Order Date', 'Items Count'].join(','),
      ...filteredPurchases.map(purchase => [
        purchase._id,
        purchase.supplier.name,
        purchase.orderType,
        purchase.status,
        purchase.totalCost.toFixed(2),
        new Date(purchase.orderDate).toLocaleDateString(),
        purchase.items.length
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-gray-600">Manage and track all purchase orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/dashboard/purchase/add-order">
            <Button>New Purchase Order</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by supplier name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders ({filteredPurchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <div key={purchase._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {getOrderTypeIcon(purchase.orderType)}
                  <div>
                    <div className="font-medium">{purchase.supplier.name}</div>
                    <div className="text-sm text-gray-600">
                      Order #{purchase._id.slice(-8)} • {purchase.items.length} items
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(purchase.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold">${purchase.totalCost.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 capitalize">{purchase.orderType}</div>
                  </div>
                  
                  <Badge className={getStatusColor(purchase.status)}>
                    {purchase.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(purchase._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Purchase Order Details</DialogTitle>
                        </DialogHeader>
                        {selectedPurchase && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium">Supplier</h4>
                                <p>{selectedPurchase.supplier.name}</p>
                                <p className="text-sm text-gray-600">{selectedPurchase.supplier.email}</p>
                              </div>
                              <div>
                                <h4 className="font-medium">Order Info</h4>
                                <p>Type: {selectedPurchase.orderType}</p>
                                <p>Status: {selectedPurchase.status}</p>
                                <p>Date: {new Date(selectedPurchase.orderDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Items</h4>
                              <div className="space-y-2">
                                {selectedPurchase.items.map((item, index) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>{item.product.name} ({item.product.sku})</span>
                                    <span>{item.quantity} × ${item.unitCost.toFixed(2)} = ${item.totalCost.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>${selectedPurchase.totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {purchase.status === 'shipped' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReceiveOrder(purchase._id)}
                      >
                        Receive
                      </Button>
                    )}
                    
                    <Select onValueChange={(value) => handleStatusUpdate(purchase._id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(purchase._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPurchases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No purchase orders found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}