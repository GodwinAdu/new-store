'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Truck, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getPurchaseStats, getAllPurchases } from '@/lib/actions/purchase-dashboard.actions';

interface PurchaseStats {
  todaySpent: number;
  todayOrders: number;
  monthSpent: number;
  monthOrders: number;
  totalSpent: number;
  totalOrders: number;
  pendingOrders: number;
  avgOrderValue: number;
  orderTypeBreakdown: Array<{
    _id: string;
    count: number;
    total: number;
  }>;
}

interface Purchase {
  _id: string;
  supplier: {
    name: string;
    email: string;
  };
  orderType: string;
  status: string;
  totalCost: number;
  orderDate: string;
  items: Array<{
    product: {
      name: string;
      sku: string;
    };
    quantity: number;
    unitCost: number;
  }>;
}

export default function PurchaseDashboard() {
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, purchasesData] = await Promise.all([
        getPurchaseStats(),
        getAllPurchases()
      ]);
      setStats(statsData);
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Failed to load purchase data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-gray-600">Manage purchase orders, suppliers, and inventory procurement</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/purchase/add-order">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.todaySpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayOrders} orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.monthOrders} orders this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per purchase order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats?.orderTypeBreakdown.map((type) => (
              <div key={type._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getOrderTypeIcon(type._id)}
                  <span className="font-medium capitalize">{type._id || 'Regular'}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{type.count} orders</div>
                  <div className="text-sm text-gray-600">${type.total.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="wholesale">Wholesale</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Purchase Orders</CardTitle>
              <Link href="/dashboard/purchase/list-orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.slice(0, 10).map((purchase) => (
                  <div key={purchase._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getOrderTypeIcon(purchase.orderType)}
                      <div>
                        <div className="font-medium">{purchase.supplier.name}</div>
                        <div className="text-sm text-gray-600">
                          {purchase.items.length} items • {new Date(purchase.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold">${purchase.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-600 capitalize">{purchase.orderType}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.filter(p => p.status === 'pending').map((purchase) => (
                  <div key={purchase._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getOrderTypeIcon(purchase.orderType)}
                      <div>
                        <div className="font-medium">{purchase.supplier.name}</div>
                        <div className="text-sm text-gray-600">
                          {purchase.items.length} items • {new Date(purchase.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold">${purchase.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-600 capitalize">{purchase.orderType}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport">
          <Card>
            <CardHeader>
              <CardTitle>Transport Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.filter(p => p.orderType === 'transport').map((purchase) => (
                  <div key={purchase._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Truck className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{purchase.supplier.name}</div>
                        <div className="text-sm text-gray-600">
                          {purchase.items.length} items • {new Date(purchase.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold">${purchase.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Transport Order</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wholesale">
          <Card>
            <CardHeader>
              <CardTitle>Wholesale Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.filter(p => p.orderType === 'wholesale').map((purchase) => (
                  <div key={purchase._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{purchase.supplier.name}</div>
                        <div className="text-sm text-gray-600">
                          {purchase.items.length} items • {new Date(purchase.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold">${purchase.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Wholesale Order</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}