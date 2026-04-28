'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShoppingCart,
  Receipt,
  Users,
  Wifi,
  WifiOff,
  Bell,
  User,
  LogOut,
  Store,
  X,
  Package,
} from 'lucide-react'
import { CustomerManagement } from './customer-management'
import { ConsolidatedSalesTab } from './consolidated-sales-tab'
import { QuickActionsBar } from './quick-actions-bar'
import { usePOSStore } from '@/lib/store/pos-store'
import type { ReceiptData } from '@/lib/utils/receipt-utils'

interface POSLayoutProps {
  children: React.ReactNode
  onReprintReceipt?: (receiptData: ReceiptData) => void
  onCalculator?: () => void
  onNoSale?: () => void
  onLastReceipt?: () => void
  cashierName?: string
}

export function POSLayout({
  children,
  onReprintReceipt,
  onCalculator,
  onNoSale,
  onLastReceipt,
  cashierName = 'Cashier',
}: POSLayoutProps) {
  const [activeTab, setActiveTab] = useState('sale')
  const [isOnline, setIsOnline] = useState(true)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Live clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  const [currentDate] = useState(
    new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 30_000)
    return () => clearInterval(timer)
  }, [])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }
    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notificationOpen])

  // Low-stock alerts from Zustand store
  const lowStockAlerts = usePOSStore((s) => s.lowStockAlerts)
  const dismissAlert = usePOSStore((s) => s.dismissAlert)

  // Exactly three tabs
  const tabs = [
    { id: 'sale', label: 'Sale', icon: ShoppingCart },
    { id: 'sales-history', label: 'Sales History', icon: Receipt },
    { id: 'customers', label: 'Customers', icon: Users },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm flex-shrink-0">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Modern POS</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Point of Sale System</p>
              </div>
            </div>

            {/* Center Section - Date/Time */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium">{currentTime}</div>
              <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
              <div className="text-sm text-muted-foreground">{currentDate}</div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              {isOnline ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Online</span>
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Offline</span>
                </Badge>
              )}

              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setNotificationOpen((v) => !v)}
                  aria-label={`Notifications${lowStockAlerts.length > 0 ? `, ${lowStockAlerts.length} unread` : ''}`}
                  data-testid="notification-bell"
                >
                  <Bell className="h-4 w-4" />
                  {lowStockAlerts.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium"
                      data-testid="notification-badge"
                    >
                      {lowStockAlerts.length}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50"
                    data-testid="notification-dropdown"
                  >
                    <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
                      {lowStockAlerts.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {lowStockAlerts.length}
                        </Badge>
                      )}
                    </div>

                    {lowStockAlerts.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No alerts
                      </div>
                    ) : (
                      <ul className="max-h-72 overflow-y-auto divide-y dark:divide-gray-700">
                        {lowStockAlerts.map((alert) => (
                          <li
                            key={alert.productId}
                            className="flex items-start gap-3 px-4 py-3"
                            data-testid="alert-item"
                            data-product-id={alert.productId}
                          >
                            <Package className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" data-testid="alert-product-name">
                                {alert.productName}
                              </p>
                              <p className="text-xs text-muted-foreground" data-testid="alert-stock-level">
                                Stock: {alert.currentStock} / Min: {alert.minStock}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => dismissAlert(alert.productId)}
                              aria-label={`Dismiss alert for ${alert.productName}`}
                              data-testid="dismiss-alert-btn"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-1 pl-2 border-l">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{cashierName}</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
        <div className="px-4 lg:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-0 p-0 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-12 px-4 sm:px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {/* Collapse label to icon on screens < 768px */}
                    <span className="font-medium hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Sale Tab */}
          <TabsContent value="sale" className="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
            {/* QuickActionsBar only on Sale tab, between tab nav and main content */}
            <QuickActionsBar
              onCalculator={onCalculator ?? (() => {})}
              onNoSale={onNoSale ?? (() => {})}
              onLastReceipt={onLastReceipt ?? (() => {})}
            />
            <div className="flex-1 overflow-auto p-4 lg:p-6">
              {children}
            </div>
          </TabsContent>

          {/* Sales History Tab */}
          <TabsContent value="sales-history" className="flex-1 m-0 p-4 lg:p-6 overflow-auto data-[state=inactive]:hidden">
            <ConsolidatedSalesTab
              onReprintReceipt={onReprintReceipt ?? (() => {})}
            />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="flex-1 m-0 p-4 lg:p-6 overflow-auto data-[state=inactive]:hidden">
            <div className="h-full flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Customer Management</h2>
                  <p className="text-muted-foreground">Manage customers and loyalty programs</p>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CustomerManagement />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
