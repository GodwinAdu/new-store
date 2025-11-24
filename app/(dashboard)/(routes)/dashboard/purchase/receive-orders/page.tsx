'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAllPurchases, receivePurchaseOrder, updatePurchaseOrder } from '@/lib/actions/purchase-dashboard.actions';

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
      _id: string;
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
  notes?: string;
}

interface ReceivedItem {
  productId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  actualCost: number;
  sellingPrice: number;
  expiryDate: string;
  condition: 'good' | 'damaged' | 'missing';
  notes: string;
}

export default function ReceiveOrders() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receiptNotes, setReceiptNotes] = useState('');

  useEffect(() => {
    loadShippedOrders();
  }, []);

  const loadShippedOrders = async () => {
    try {
      const data = await getAllPurchases({ status: 'shipped' });
      setPurchases(data);
    } catch (error) {
      console.error('Failed to load shipped orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setReceivedItems(
      purchase.items.map(item => ({
        productId: item.product._id,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        actualCost: item.unitCost,
        sellingPrice: item.unitCost * 1.3, // Default 30% markup
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year default
        condition: 'good' as const,
        notes: ''
      }))
    );
  };

  const updateReceivedItem = (index: number, field: keyof ReceivedItem, value: any) => {
    const updated = [...receivedItems];
    updated[index] = { ...updated[index], [field]: value };
    setReceivedItems(updated);
  };

  const calculateReceiptSummary = () => {
    if (!selectedPurchase) return { totalOrdered: 0, totalReceived: 0, totalCost: 0, discrepancies: 0 };

    const totalOrdered = receivedItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
    const totalReceived = receivedItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
    const totalCost = receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.actualCost), 0);
    const discrepancies = receivedItems.filter(item => 
      item.receivedQuantity !== item.orderedQuantity || item.condition !== 'good'
    ).length;

    return { totalOrdered, totalReceived, totalCost, discrepancies };
  };

  const handleReceiveOrder = async () => {
    if (!selectedPurchase) return;

    setProcessing(true);
    try {
      // Receive the order with actual quantities and costs
      await receivePurchaseOrder(
        selectedPurchase._id,
        receivedItems.map(item => ({
          productId: item.productId,
          receivedQuantity: item.receivedQuantity,
          actualCost: item.actualCost,
          sellingPrice: item.sellingPrice,
          expiryDate: new Date(item.expiryDate)
        }))
      );

      // Update order notes if any
      if (receiptNotes) {
        await updatePurchaseOrder(selectedPurchase._id, {
          notes: `${selectedPurchase.notes || ''}\n\nReceipt Notes: ${receiptNotes}`
        });
      }

      // Redirect back to purchase dashboard
      router.push('/dashboard/purchase');
    } catch (error) {
      console.error('Failed to receive order:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'damaged': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const summary = calculateReceiptSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Receive Orders</h1>
          <p className="text-gray-600">Process incoming shipments and update inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipped Orders List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipped Orders ({purchases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPurchase?._id === purchase._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectOrder(purchase)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{purchase.supplier.name}</div>
                        <div className="text-sm text-gray-600">
                          #{purchase._id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {purchase.items.length} items • ${purchase.totalCost.toFixed(2)}
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        {purchase.status}
                      </Badge>
                    </div>
                    
                    {purchase.transportDetails && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Carrier: {purchase.transportDetails.carrier}</div>
                        {purchase.transportDetails.trackingNumber && (
                          <div>Tracking: {purchase.transportDetails.trackingNumber}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {purchases.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No shipped orders to receive
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Processing */}
        <div className="lg:col-span-2">
          {selectedPurchase ? (
            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Receiving Order #{selectedPurchase._id.slice(-8)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Supplier</h4>
                      <p>{selectedPurchase.supplier.name}</p>
                      <p className="text-sm text-gray-600">{selectedPurchase.supplier.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Order Details</h4>
                      <p>Type: {selectedPurchase.orderType}</p>
                      <p>Order Date: {new Date(selectedPurchase.orderDate).toLocaleDateString()}</p>
                      <p>Total Cost: ${selectedPurchase.totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Receipt */}
              <Card>
                <CardHeader>
                  <CardTitle>Items Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {receivedItems.map((item, index) => {
                      const originalItem = selectedPurchase.items[index];
                      return (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
                            <div className="md:col-span-2">
                              <div className="font-medium">{originalItem.product.name}</div>
                              <div className="text-sm text-gray-600">{originalItem.product.sku}</div>
                            </div>
                            
                            <div className="text-center">
                              <Label className="text-xs">Ordered</Label>
                              <div className="font-medium">{item.orderedQuantity}</div>
                            </div>
                            
                            <div>
                              <Label htmlFor={`received-${index}`} className="text-xs">Received</Label>
                              <Input
                                id={`received-${index}`}
                                type="number"
                                value={item.receivedQuantity}
                                onChange={(e) => updateReceivedItem(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`cost-${index}`} className="text-xs">Unit Cost</Label>
                              <Input
                                id={`cost-${index}`}
                                type="number"
                                step="0.01"
                                value={item.actualCost}
                                onChange={(e) => updateReceivedItem(index, 'actualCost', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`selling-${index}`} className="text-xs">Selling Price</Label>
                              <Input
                                id={`selling-${index}`}
                                type="number"
                                step="0.01"
                                value={item.sellingPrice}
                                onChange={(e) => updateReceivedItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`expiry-${index}`} className="text-xs">Expiry Date</Label>
                              <Input
                                id={`expiry-${index}`}
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) => updateReceivedItem(index, 'expiryDate', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Condition</Label>
                              <Select
                                value={item.condition}
                                onValueChange={(value: any) => updateReceivedItem(index, 'condition', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="damaged">Damaged</SelectItem>
                                  <SelectItem value="missing">Missing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {item.condition !== 'good' && (
                            <div className="mt-3">
                              <Label htmlFor={`notes-${index}`} className="text-xs">Notes</Label>
                              <Textarea
                                id={`notes-${index}`}
                                value={item.notes}
                                onChange={(e) => updateReceivedItem(index, 'notes', e.target.value)}
                                placeholder="Describe the issue..."
                                rows={2}
                              />
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between">
                            <Badge className={getConditionColor(item.condition)}>
                              {item.condition}
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Line Total</div>
                              <div className="font-medium">${(item.receivedQuantity * item.actualCost).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Receipt Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Receipt Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{summary.totalOrdered}</div>
                      <div className="text-sm text-gray-600">Ordered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{summary.totalReceived}</div>
                      <div className="text-sm text-gray-600">Received</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${summary.totalCost.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Actual Cost</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${summary.discrepancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {summary.discrepancies}
                      </div>
                      <div className="text-sm text-gray-600">Discrepancies</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="receiptNotes">Receipt Notes</Label>
                      <Textarea
                        id="receiptNotes"
                        value={receiptNotes}
                        onChange={(e) => setReceiptNotes(e.target.value)}
                        placeholder="Add any notes about this receipt..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={handleReceiveOrder}
                        disabled={processing}
                        className="flex-1"
                      >
                        {processing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Complete Receipt
                      </Button>
                      
                      {summary.discrepancies > 0 && (
                        <Button variant="outline" className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Report Issues
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order to Receive</h3>
                  <p className="text-gray-600">Choose a shipped order from the list to begin the receiving process</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}