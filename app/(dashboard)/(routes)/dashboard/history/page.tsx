'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar, Activity } from 'lucide-react';

const historyData = [
  { id: '1', action: 'Sale Created', user: 'John Doe', timestamp: '2024-12-20 10:30 AM', details: 'Sale #12345 - $150.00', type: 'sale' },
  { id: '2', action: 'Product Added', user: 'Jane Smith', timestamp: '2024-12-20 09:15 AM', details: 'Added "Wireless Headphones" to inventory', type: 'product' },
  { id: '3', action: 'Purchase Order', user: 'Mike Johnson', timestamp: '2024-12-19 04:45 PM', details: 'PO #PO001 - $2,500.00', type: 'purchase' },
  { id: '4', action: 'Customer Added', user: 'Sarah Wilson', timestamp: '2024-12-19 02:20 PM', details: 'New customer: Alice Brown', type: 'customer' },
  { id: '5', action: 'Inventory Update', user: 'John Doe', timestamp: '2024-12-19 11:30 AM', details: 'Stock adjustment for SKU-001', type: 'inventory' }
];

export default function HistoryPage() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'purchase': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-orange-100 text-orange-800';
      case 'inventory': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'product': return '📦';
      case 'purchase': return '🛒';
      case 'customer': return '👤';
      case 'inventory': return '📊';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">System History</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historyData.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="text-2xl">{getTypeIcon(item.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{item.action}</div>
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{item.details}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.user}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['sale', 'product', 'purchase', 'customer', 'inventory'].map((type) => {
              const count = historyData.filter(item => item.type === type).length;
              return (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{type}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}