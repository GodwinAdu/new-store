import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { fetchAllProducts } from "@/lib/actions/product.actions"
import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import { fetchAllStocks } from "@/lib/actions/product-batch.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, Check, X, Eye, TrendingUp, TrendingDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StockAdjustmentClient from "./_components/stock-adjustment-client"

const adjustmentHistory = [
  {
    id: "ADJ-001",
    date: "2024-01-15",
    product: "Chicken Breast",
    sku: "SKU-002",
    warehouse: "Cold Storage",
    type: "Increase",
    quantity: 50,
    reason: "Stock Count Correction",
    user: "John Smith",
    status: "Approved",
    approvedBy: "Manager",
    notes: "Physical count showed 65 units, system showed 15",
  },
  {
    id: "ADJ-002",
    date: "2024-01-14",
    product: "Chicken Wings",
    sku: "SKU-006",
    warehouse: "Warehouse B",
    type: "Decrease",
    quantity: 12,
    reason: "Damaged Goods",
    user: "Sarah Wilson",
    status: "Pending",
    approvedBy: null,
    notes: "Damaged during transport, not suitable for sale",
  },
  {
    id: "ADJ-003",
    date: "2024-01-13",
    product: "Whole Chicken",
    sku: "SKU-001",
    warehouse: "Warehouse A",
    type: "Increase",
    quantity: 25,
    reason: "Supplier Bonus",
    user: "Mike Johnson",
    status: "Approved",
    approvedBy: "Manager",
    notes: "Supplier provided extra units as promotion",
  },
  {
    id: "ADJ-004",
    date: "2024-01-12",
    product: "Chicken Thighs",
    sku: "SKU-003",
    warehouse: "Cold Storage",
    type: "Decrease",
    quantity: 8,
    reason: "Expired Products",
    user: "Tom Brown",
    status: "Rejected",
    approvedBy: "Manager",
    notes: "Expiry date verification failed",
  },
]

const adjustmentReasons = [
  "Stock Count Correction",
  "Damaged Goods",
  "Expired Products",
  "Theft/Loss",
  "Supplier Bonus",
  "Quality Issues",
  "System Error",
  "Transfer Error",
  "Other",
]

export default async function StockAdjustment() {
  const [products, warehouses, stockData] = await Promise.all([
    fetchAllProducts(),
    fetchAllWarehouses(), 
    fetchAllStocks()
  ])

  return (
    <StockAdjustmentClient 
      products={products}
      warehouses={warehouses}
      stockData={stockData}
    />
    )
}
