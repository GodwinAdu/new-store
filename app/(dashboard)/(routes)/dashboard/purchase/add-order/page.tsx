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
import { createPurchaseOrder, getSuppliers, getProductsForPurchase } from '@/lib/actions/purchase-dashboard.actions';
import { getWarehouses, getVehicles } from '@/lib/actions/transport.actions';
import { fetchAllUnits } from '@/lib/actions/unit.actions';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price?: number;
  stock?: number;
  unit: Array<{
    _id: string;
    name: string;
    shortName: string;
    conversionFactor: number;
    unitType: 'base' | 'derived';
  }>;
}

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  address: string;
}

interface Vehicle {
  _id: string;
  plateNumber: string;
  type: string;
  capacity: string;
  driver: string;
  status: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitId: string;
  unitName: string;
  conversionFactor: number;
  quantity: number;
  baseQuantity: number;
  unitCost: number;
  baseUnitCost: number;
}

export default function AddPurchaseOrder() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [units, setUnits] = useState<any[]>([]);
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
    shippingCost: 0,
    warehouseId: '',
    vehicleId: '',
    driver: ''
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
      console.log('Loading data...');
      const [productsData, suppliersData, warehousesData, vehiclesData, unitsData] = await Promise.all([
        getProductsForPurchase(),
        getSuppliers(),
        getWarehouses(),
        getVehicles(),
        fetchAllUnits()
      ]);
      console.log('Products loaded:', productsData?.length || 0);
      console.log('First product:', productsData?.[0]);
      console.log('Suppliers loaded:', suppliersData?.length || 0);
      console.log('Warehouses loaded:', warehousesData?.length || 0);
      console.log('Vehicles loaded:', vehiclesData?.length || 0);
      console.log('Units loaded:', unitsData?.length || 0);
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);
      setWarehouses(warehousesData || []);
      setVehicles(vehiclesData || []);
      setUnits(unitsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays as fallback
      setProducts([]);
      setSuppliers([]);
      setWarehouses([]);
      setVehicles([]);
      setUnits([]);
    }
  };

  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      sku: '',
      unitId: '',
      unitName: '',
      conversionFactor: 1,
      quantity: 1,
      baseQuantity: 1,
      unitCost: 0,
      baseUnitCost: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => (p._id || p.id) === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].sku = product.sku;
        // Use a more professional cost estimation (70% of selling price or default)
        const estimatedCost = product.price ? Math.round(product.price * 0.7 * 100) / 100 : 10;
        updatedItems[index].unitCost = estimatedCost;
        updatedItems[index].baseUnitCost = estimatedCost;
        
        // Auto-select unit (product's first unit or first available unit)
        let unitToSelect = null;
        
        if (product.unit && product.unit.length > 0) {
          // Use product's first assigned unit (already populated)
          unitToSelect = product.unit[0];
        } else if (units.length > 0) {
          // Use first available unit if product has no assigned units
          unitToSelect = units[0];
        }
        
        if (unitToSelect) {
          updatedItems[index].unitId = unitToSelect._id;
          updatedItems[index].unitName = unitToSelect.name;
          updatedItems[index].conversionFactor = unitToSelect.conversionFactor || 1;
          
          // Set quantity based on unit type
          if (unitToSelect.unitType === 'base') {
            updatedItems[index].quantity = 1;
            updatedItems[index].baseQuantity = 1;
          } else {
            updatedItems[index].quantity = unitToSelect.conversionFactor || 1;
            updatedItems[index].baseQuantity = unitToSelect.conversionFactor || 1;
          }
          
          updatedItems[index].baseUnitCost = updatedItems[index].unitCost / (unitToSelect.conversionFactor || 1);
        }
      }
    }
    
    if (field === 'unitId') {
      const unit = units.find(u => u._id === value);
      if (unit) {
        updatedItems[index].unitName = unit.name;
        updatedItems[index].conversionFactor = unit.conversionFactor || 1;
        
        // Auto-set quantity based on unit type
        if (unit.unitType === 'base') {
          // Base unit: quantity = 1 (no conversion)
          updatedItems[index].quantity = 1;
          updatedItems[index].baseQuantity = 1;
        } else {
          // Derived unit: quantity = base unit × conversion factor
          updatedItems[index].quantity = unit.conversionFactor || 1;
          updatedItems[index].baseQuantity = unit.conversionFactor || 1;
        }
        
        // Recalculate unit cost based on conversion
        updatedItems[index].baseUnitCost = updatedItems[index].unitCost / (unit.conversionFactor || 1);
      }
    }
    
    if (field === 'quantity' || field === 'unitCost') {
      // Recalculate base values when quantity or unit cost changes
      const unit = units.find(u => u._id === updatedItems[index].unitId);
      if (unit) {
        const conversionFactor = unit.conversionFactor || 1;
        
        if (field === 'quantity') {
          if (unit.unitType === 'base') {
            // Base unit: no conversion needed
            updatedItems[index].baseQuantity = value;
          } else {
            // Derived unit: quantity × conversion factor
            updatedItems[index].baseQuantity = value * conversionFactor;
          }
        }
        
        if (field === 'unitCost') {
          if (unit.unitType === 'base') {
            // Base unit: no conversion needed
            updatedItems[index].baseUnitCost = value;
          } else {
            // Derived unit: cost ÷ conversion factor
            updatedItems[index].baseUnitCost = value / conversionFactor;
          }
        }
      }
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    // Calculate subtotal using base quantities and base unit costs for accuracy
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.baseQuantity * item.baseUnitCost;
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    
    const shippingCost = formData.orderType === 'transport' ? (transportDetails.shippingCost || 0) : 0;
    const discount = formData.orderType === 'wholesale' ? (wholesaleDetails.bulkDiscount || 0) : 0;
    
    // Ensure all values are valid numbers
    const validSubtotal = isNaN(subtotal) ? 0 : subtotal;
    const validShippingCost = isNaN(shippingCost) ? 0 : shippingCost;
    const validDiscount = isNaN(discount) ? 0 : discount;
    
    const total = validSubtotal + validShippingCost - validDiscount;
    
    return { 
      subtotal: validSubtotal, 
      shippingCost: validShippingCost, 
      discount: validDiscount, 
      total: Math.max(0, total) // Ensure total is never negative
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || items.length === 0) return;
    
    // Validate transport order requirements
    if (formData.orderType === 'transport' && (!transportDetails.warehouseId || !transportDetails.vehicleId)) {
      alert('Please select both warehouse and vehicle for transport orders');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        supplierId: formData.supplierId,
        items: items.map(item => ({
          productId: item.productId,
          unit: item.unitId,
          quantity: item.quantity,
          baseQuantity: item.baseQuantity,
          unitPrice: item.unitCost,
          baseUnitPrice: item.baseUnitCost
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
                          <SelectItem key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
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
                      <Label htmlFor="warehouse">Destination Warehouse *</Label>
                      <Select value={transportDetails.warehouseId} onValueChange={(value) => setTransportDetails({...transportDetails, warehouseId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse._id} value={warehouse._id}>
                              {warehouse.name} - {warehouse.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="vehicle">Vehicle *</Label>
                      <Select value={transportDetails.vehicleId} onValueChange={(value) => {
                        const selectedVehicle = vehicles.find(v => v._id === value);
                        setTransportDetails({
                          ...transportDetails, 
                          vehicleId: value,
                          driver: selectedVehicle?.driver || ''
                        });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                            <SelectItem key={vehicle._id} value={vehicle._id}>
                              {vehicle.plateNumber} - {vehicle.type} ({vehicle.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="driver">Driver</Label>
                      <Input
                        id="driver"
                        value={transportDetails.driver}
                        onChange={(e) => setTransportDetails({...transportDetails, driver: e.target.value})}
                        placeholder="Driver name"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                      <Input
                        id="estimatedDelivery"
                        type="date"
                        value={transportDetails.estimatedDelivery}
                        onChange={(e) => setTransportDetails({...transportDetails, estimatedDelivery: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="shippingCost">Shipping Cost</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₵</span>
                        <Input
                          id="shippingCost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={transportDetails.shippingCost || 0}
                          onChange={(e) => setTransportDetails({...transportDetails, shippingCost: Math.max(0, parseFloat(e.target.value) || 0)})}
                          placeholder="0.00"
                          className="pl-8"
                        />
                      </div>
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
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₵</span>
                        <Input
                          id="bulkDiscount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={wholesaleDetails.bulkDiscount || 0}
                          onChange={(e) => setWholesaleDetails({...wholesaleDetails, bulkDiscount: Math.max(0, parseFloat(e.target.value) || 0)})}
                          placeholder="0.00"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
                      <Input
                        id="minimumQuantity"
                        type="number"
                        value={wholesaleDetails.minimumQuantity || 0}
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
                    <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg">
                      <div className="col-span-4">
                        <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product._id || product.id} value={product._id || product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-3">
                        <Select value={item.unitId} onValueChange={(value) => updateItem(index, 'unitId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              if (!item.productId) {
                                // Show all units if no product selected
                                return units.map((unit) => (
                                  <SelectItem key={unit._id} value={unit._id}>
                                    {unit.name} {unit.unitType === 'derived' && `(${unit.conversionFactor})`}
                                  </SelectItem>
                                ));
                              }
                              
                              const selectedProduct = products.find(p => (p._id || p.id) === item.productId);
                              const productUnits = selectedProduct?.unit || [];
                              
                              if (productUnits.length === 0) {
                                // Show all units if product has no assigned units
                                return units.map((unit) => (
                                  <SelectItem key={unit._id} value={unit._id}>
                                    {unit.name} {unit.unitType === 'derived' && `(${unit.conversionFactor})`}
                                  </SelectItem>
                                ));
                              }
                              
                              // Show only product's assigned units (already populated)
                              return productUnits.map((unit) => (
                                <SelectItem key={unit._id} value={unit._id}>
                                  {unit.name} {unit.unitType === 'derived' && `(${unit.conversionFactor})`}
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                          min="1"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₵</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost || 0}
                            onChange={(e) => updateItem(index, 'unitCost', Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="0.00"
                            className="pl-8"
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
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
                    <span className="font-medium">₵{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {formData.orderType === 'transport' && shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping Cost:</span>
                      <span className="font-medium">₵{shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {formData.orderType === 'wholesale' && discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Bulk Discount:</span>
                      <span className="font-medium">-₵{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">₵{total.toFixed(2)}</span>
                  </div>
                  
                  {items.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {items.length} item{items.length !== 1 ? 's' : ''} • {items.reduce((sum, item) => sum + (item.baseQuantity || 0), 0)} total units
                    </div>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !formData.supplierId || items.length === 0 || 
                    (formData.orderType === 'transport' && (!transportDetails.warehouseId || !transportDetails.vehicleId))}
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