'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Package, Truck, ShoppingCart, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPurchaseOrder, getSuppliers } from '@/lib/actions/purchase-dashboard.actions';
import { getProducts } from '@/lib/actions/pos.actions';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export default function AddPurchaseOrder() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    orderType: 'regular' as 'regular' | 'transport' | 'wholesale',
    notes: ''
  });
  
  const [items, setItems] = useState<OrderItem[]>([]);
  
  const [transportDetails, setTransportDetails] = useState({
    carrier: '',
    trackingNumber: '',
    estimatedDelivery: '',
    shippingCost: 0
  });
  
  const [wholesaleDetails, setWholesaleDetails] = useState({
    bulkDiscount: 0,
    minimumQuantity: 0,
    contractNumber: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, suppliersData] = await Promise.all([
        getProducts(),
        getSuppliers()
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      sku: '',
      quantity: 1,
      unitCost: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].sku = product.sku;
        updatedItems[index].unitCost = product.price * 0.7;
      }
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const shippingCost = formData.orderType === 'transport' ? transportDetails.shippingCost : 0;
    const discount = formData.orderType === 'wholesale' ? wholesaleDetails.bulkDiscount : 0;
    const total = subtotal + shippingCost - discount;
    
    return { subtotal, shippingCost, discount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || items.length === 0) return;
    
    setLoading(true);
    try {
      const orderData = {
        supplierId: formData.supplierId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        })),
        orderType: formData.orderType,
        transportDetails: formData.orderType === 'transport' ? {
          ...transportDetails,
          estimatedDelivery: transportDetails.estimatedDelivery ? new Date(transportDetails.estimatedDelivery) : undefined
        } : undefined,
        wholesaleDetails: formData.orderType === 'wholesale' ? wholesaleDetails : undefined,
        notes: formData.notes
      };
      
      await createPurchaseOrder(orderData);
      router.push('/dashboard/purchase');
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, shippingCost, discount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Purchase Order</h1>
          <p className="text-gray-600">Add new purchase order for inventory procurement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select value={formData.supplierId} onValueChange={(value) => setFormData({...formData, supplierId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="orderType">Order Type *</Label>
                    <Select value={formData.orderType} onValueChange={(value: any) => setFormData({...formData, orderType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Regular Order
                          </div>
                        </SelectItem>
                        <SelectItem value="transport">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Transport Order
                          </div>
                        </SelectItem>
                        <SelectItem value="wholesale">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Wholesale Order
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes for this order..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {formData.orderType === 'transport' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Transport Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carrier">Carrier</Label>
                      <Input
                        id="carrier"
                        value={transportDetails.carrier}
                        onChange={(e) => setTransportDetails({...transportDetails, carrier: e.target.value})}
                        placeholder="e.g., FedEx, UPS, DHL"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="shippingCost">Shipping Cost</Label>
                      <Input
                        id="shippingCost"
                        type="number"
                        step="0.01"
                        value={transportDetails.shippingCost}
                        onChange={(e) => setTransportDetails({...transportDetails, shippingCost: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.orderType === 'wholesale' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Wholesale Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bulkDiscount">Bulk Discount</Label>
                      <Input
                        id="bulkDiscount"
                        type="number"
                        step="0.01"
                        value={wholesaleDetails.bulkDiscount}
                        onChange={(e) => setWholesaleDetails({...wholesaleDetails, bulkDiscount: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
                      <Input
                        id="minimumQuantity"
                        type="number"
                        value={wholesaleDetails.minimumQuantity}
                        onChange={(e) => setWholesaleDetails({...wholesaleDetails, minimumQuantity: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                          min="1"
                        />
                      </div>
                      
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          placeholder="Unit Cost"
                        />
                      </div>
                      
                      <div className="w-32 text-right font-medium">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No items added yet. Click "Add Item" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {formData.orderType === 'transport' && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {formData.orderType === 'wholesale' && discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Bulk Discount:</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !formData.supplierId || items.length === 0}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}