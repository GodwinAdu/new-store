"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Package,
  BarChart3,
  Calendar
} from "lucide-react"
import { getWarehouseAnalyticsSummary } from "@/lib/actions/warehouse-analytics.actions"

interface AnalyticsDashboardProps {
  warehouseId: string
}

export default function AnalyticsDashboard({ warehouseId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (warehouseId) {
      fetchAnalytics()
    }
  }, [warehouseId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const data = await getWarehouseAnalyticsSummary(warehouseId)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>No analytics data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Turnover Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.summary.avgTurnoverRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.summary.avgProfitMargin}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Slow Moving Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₵{analytics.summary.slowMovingValue}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Expiry</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.summary.criticalExpiryCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Performers (Turnover)
                </CardTitle>
                <CardDescription>Products with highest turnover rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformers.map((item: any, index: number) => (
                    <div key={item.product._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Sold: {item.soldQuantity} | Stock: {item.currentStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {item.turnoverRate}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₵{item.revenue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Low Profit Margins
                </CardTitle>
                <CardDescription>Products with profit margins below 10%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.lowPerformers.map((item: any, index: number) => (
                    <div key={item.product._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Cost: ₵{item.unitCost} | Price: ₵{item.sellingPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {item.profitMargin}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₵{item.potentialProfit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slow Moving Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Slow Moving Stock
                </CardTitle>
                <CardDescription>Items that haven't moved in 60+ days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.urgentActions.slowMoving.map((item: any, index: number) => (
                    <div key={item.product._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.daysInStock} days in stock | {item.quantity} units
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-orange-200 text-orange-800">
                          ₵{item.totalValue}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critical Expiry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Expiry Alerts
                </CardTitle>
                <CardDescription>Items expiring within 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.urgentActions.expiring.map((item: any, index: number) => (
                    <div key={item.product._id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Expires in {item.daysToExpiry} days | {item.quantity} units
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          ₵{item.totalValue}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Inventory Health</h4>
                  <p className="text-blue-800 text-sm">
                    Your average turnover rate is {analytics.summary.avgTurnoverRate}%. 
                    {analytics.summary.avgTurnoverRate > 50 ? ' Excellent performance!' : 
                     analytics.summary.avgTurnoverRate > 30 ? ' Good performance, room for improvement.' : 
                     ' Consider reviewing slow-moving items.'}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Profitability</h4>
                  <p className="text-green-800 text-sm">
                    Average profit margin is {analytics.summary.avgProfitMargin}%. 
                    {analytics.lowPerformers.length > 0 && 
                      ` Consider repricing ${analytics.lowPerformers.length} low-margin products.`}
                  </p>
                </div>

                {analytics.summary.slowMovingValue > 1000 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Action Required</h4>
                    <p className="text-orange-800 text-sm">
                      ₵{analytics.summary.slowMovingValue} tied up in slow-moving inventory. 
                      Consider promotions or clearance sales.
                    </p>
                  </div>
                )}

                {analytics.summary.criticalExpiryCount > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Urgent Action</h4>
                    <p className="text-red-800 text-sm">
                      {analytics.summary.criticalExpiryCount} items expiring within 7 days. 
                      Immediate action required to prevent losses.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={fetchAnalytics} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Analytics
        </Button>
      </div>
    </div>
  )
}