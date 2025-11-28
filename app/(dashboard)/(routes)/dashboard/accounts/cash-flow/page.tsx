'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, Download } from 'lucide-react'
import { getCashFlow } from '@/lib/actions/accounts.actions'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CashFlowData {
  summary: {
    openingBalance: number
    totalInflows: number
    totalOutflows: number
    netCashFlow: number
    closingBalance: number
    period: { start: string; end: string }
  }
  breakdown: {
    inflows: Record<string, number>
    outflows: Record<string, number>
  }
  monthly: Array<{
    month: string
    inflows: number
    outflows: number
    netFlow: number
  }>
  transactions: {
    inflows: any[]
    outflows: any[]
  }
  accounts: {
    cash: any[]
    bank: any[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function CashFlowPage() {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('current-year')

  useEffect(() => {
    loadCashFlow()
  }, [period])

  const loadCashFlow = async () => {
    setLoading(true)
    try {
      let startDate: Date
      let endDate = new Date()
      
      switch (period) {
        case 'current-month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
          break
        case 'last-month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
          endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
          break
        case 'current-year':
          startDate = new Date(endDate.getFullYear(), 0, 1)
          break
        case 'last-year':
          startDate = new Date(endDate.getFullYear() - 1, 0, 1)
          endDate = new Date(endDate.getFullYear() - 1, 11, 31)
          break
        default:
          startDate = new Date(endDate.getFullYear(), 0, 1)
      }
      
      const data = await getCashFlow(startDate, endDate)
      setCashFlowData(data)
    } catch (error) {
      console.error('Failed to load cash flow:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!cashFlowData) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load cash flow data</p>
          <Button onClick={loadCashFlow} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { summary, breakdown, monthly } = cashFlowData

  // Prepare chart data
  const inflowsChartData = Object.entries(breakdown.inflows).map(([category, amount]) => ({
    name: category,
    value: amount
  }))

  const outflowsChartData = Object.entries(breakdown.outflows).map(([category, amount]) => ({
    name: category,
    value: amount
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cash Flow Statement</h1>
          <p className="text-gray-600">
            Cash flow analysis from {new Date(summary.period.start).toLocaleDateString()} to {new Date(summary.period.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadCashFlow}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">₵{summary.openingBalance.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Opening Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">₵{summary.totalInflows.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Inflows</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">₵{summary.totalOutflows.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Outflows</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <div className={`text-2xl font-bold ${
                  summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₵{summary.netCashFlow.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Cash Flow</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">₵{summary.closingBalance.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Closing Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, '']} />
              <Bar dataKey="inflows" fill="#10B981" name="Inflows" />
              <Bar dataKey="outflows" fill="#EF4444" name="Outflows" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Cash Inflows by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inflowsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inflowsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inflowsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No inflow data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Cash Outflows by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outflowsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={outflowsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {outflowsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No outflow data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Cash Flows from Operating Activities</h3>
              <div className="space-y-2">
                {Object.entries(breakdown.inflows).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-green-700">{category}</span>
                    <span className="font-mono text-green-600">₵{amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.entries(breakdown.outflows).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-red-700">{category}</span>
                    <span className="font-mono text-red-600">(₵{amount.toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Opening Cash Balance</span>
                  <span className="font-mono">₵{summary.openingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Net Cash Flow</span>
                  <span className={`font-mono ${
                    summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.netCashFlow >= 0 ? '' : '('}₵{Math.abs(summary.netCashFlow).toLocaleString()}{summary.netCashFlow >= 0 ? '' : ')'}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Closing Cash Balance</span>
                    <span className="font-mono">₵{summary.closingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}