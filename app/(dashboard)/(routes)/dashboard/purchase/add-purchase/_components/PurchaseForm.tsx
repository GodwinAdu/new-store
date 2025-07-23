"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Calculator } from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PurchaseItem {
  id: string
  product: string
  quantity: number
  unitPrice: number
  total: number
}

interface ExpenseItem {
  id: string
  description: string
  amount: number
}

export default function PurchaseForm({products,warehouses}) {
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { id: "1", product: "", quantity: 0, unitPrice: 0, total: 0 },
  ])

  const [expenses, setExpenses] = useState<ExpenseItem[]>([{ id: "1", description: "", amount: 0 }])

  const addPurchaseItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      product: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
    }
    setPurchaseItems([...purchaseItems, newItem])
  }

  const removePurchaseItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter((item) => item.id !== id))
  }

  const updatePurchaseItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setPurchaseItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
    }
    setExpenses([...expenses, newExpense])
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses((expenses) => expenses.map((expense) => (expense.id === id ? { ...expense, [field]: value } : expense)))
  }

  const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const grandTotal = subtotal + totalExpenses

  return (

    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
            <CardDescription>Basic information about the purchase order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po-number">PO Number</Label>
                <Input id="po-number" placeholder="PO-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresh-farms">Fresh Farms Ltd</SelectItem>
                  <SelectItem value="poultry-express">Poultry Express</SelectItem>
                  <SelectItem value="quality-chicken">Quality Chicken Co</SelectItem>
                  <SelectItem value="farm-direct">Farm Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-delivery">Expected Delivery</Label>
              <Input id="expected-delivery" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>Where should the products be delivered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse)=>(
                  <SelectItem key={warehouse._id} value={warehouse._id}>{warehouse.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-address">Delivery Address</Label>
              <Textarea id="delivery-address" placeholder="Full delivery address..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input id="contact-person" placeholder="Name of contact person" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input id="contact-phone" placeholder="Phone number" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Items</CardTitle>
              <CardDescription>Add products to this purchase order</CardDescription>
            </div>
            <Button onClick={addPurchaseItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Select onValueChange={(value) => updatePurchaseItem(item.id, "product", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product)=>(
                        <SelectItem key={product._id} value={product._id}>{product.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updatePurchaseItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updatePurchaseItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePurchaseItem(item.id)}
                      disabled={purchaseItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Additional Expenses</CardTitle>
              <CardDescription>Transport, handling, and other costs</CardDescription>
            </div>
            <Button onClick={addExpense} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Input
                      value={expense.description}
                      onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                      placeholder="e.g., Transport cost, Handling fee"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={expense.amount}
                      onChange={(e) => updateExpense(expense.id, "amount", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpense(expense.id)}
                      disabled={expenses.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Additional Expenses:</span>
              <span>${totalExpenses.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
