'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Star,
  Target,
  Zap
} from 'lucide-react'

interface AnalyticsData {
  todaySales: number
  todayTransactions: number
  averageOrderValue: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  hourlyData: Array<{
    hour: string
    sales: number
  }>
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    loyaltyRedemptions: number
  }
}

const mockAnalytics: AnalyticsData = {
  todaySales: 2847.50,
  todayTransactions: 127,
  averageOrderValue: 22.42,
  topProducts: [
    { name: 'Premium Coffee', sales: 45, revenue: 224.55 },
    { name: 'Sandwich', sales: 23, revenue: 183.77 },
    { name: 'Fresh Salad', sales: 18, revenue: 161.82 },
  ],
  hourlyData: [
    { hour: '9AM', sales: 12 },
    { hour: '10AM', sales: 18 },
    { hour: '11AM', sales: 25 },
    { hour: '12PM', sales: 35 },
    { hour: '1PM', sales: 28 },
    { hour: '2PM', sales: 15 },
  ],
  customerMetrics: {
    newCustomers: 23,
    returningCustomers: 104,
    loyaltyRedemptions: 15
  }
}

export function POSAnalytics() {
  const salesGrowth = 12.5
  const transactionGrowth = 8.3

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockAnalytics.todaySales.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{salesGrowth}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.todayTransactions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{transactionGrowth}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockAnalytics.averageOrderValue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12PM</div>
            <div className="text-xs text-muted-foreground">35 transactions</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Hourly Sales Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalytics.hourlyData.map((data) => (
              <div key={data.hour} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium">{data.hour}</div>
                <div className="flex-1">
                  <Progress value={(data.sales / 35) * 100} className="h-2" />
                </div>
                <div className="w-12 text-sm text-right">{data.sales}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Top Products Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">${product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">New Customers</span>
                </div>
                <span className="font-semibold">{mockAnalytics.customerMetrics.newCustomers}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Returning Customers</span>
                </div>
                <span className="font-semibold">{mockAnalytics.customerMetrics.returningCustomers}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Loyalty Redemptions</span>
                </div>
                <span className="font-semibold">{mockAnalytics.customerMetrics.loyaltyRedemptions}</span>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">Customer Retention Rate</div>
                <Progress value={82} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">82% retention rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}