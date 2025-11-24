'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Users, 
  Settings, 
  Receipt, 
  Clock,
  Wifi,
  WifiOff,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { CustomerManagement } from './customer-management'
import { SalesHistory } from './sales-history'

interface POSLayoutProps {
  children: React.ReactNode
}

export function POSLayout({ children }: POSLayoutProps) {
  const [activeTab, setActiveTab] = useState('pos')
  const [isOnline, setIsOnline] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications] = useState(3)

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const currentDate = new Date().toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const tabs = [
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'sales', label: 'Sales', icon: Receipt },
    { id: 'customers', label: 'Customers', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold">Modern POS</h1>
                  <p className="text-xs text-muted-foreground">Advanced Point of Sale</p>
                </div>
              </div>
            </div>

            {/* Center Section - Date/Time */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm font-medium">{currentTime}</div>
                <div className="text-xs text-muted-foreground">{currentDate}</div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Navigation Tabs */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block mb-6`}>
          <Card className="p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="pos" className="mt-0">
              {children}
            </TabsContent>
            
            <TabsContent value="sales" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Sales Management</h2>
                    <p className="text-muted-foreground">Complete sales transactions and reporting</p>
                  </div>
                  <Button variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    Sales Report
                  </Button>
                </div>
                <SalesHistory />
              </div>
            </TabsContent>
            

            
            <TabsContent value="customers" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Customer Management</h2>
                    <p className="text-muted-foreground">Manage customer relationships and loyalty programs</p>
                  </div>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Customer Report
                  </Button>
                </div>
                <CustomerManagement />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Quick Actions Floating Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button size="lg" className="rounded-full shadow-lg">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>

      {/* Status Bar (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t p-2 lg:hidden">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Session: 2h 34m</span>
            <span>•</span>
            <span>Last sync: {currentTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Connected
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                Offline Mode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}