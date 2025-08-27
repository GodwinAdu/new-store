import React from 'react'
import { Suspense } from 'react'
import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { ShipmentDashboard } from './_components/shipment-dashboard'
import { ShipmentTable } from './_components/shipment-table'
import { CreateShipmentDialog } from './_components/create-shipment-dialog'
import { ShipmentAnalytics } from './_components/shipment-analytics'
import { ShipmentNotifications } from './_components/shipment-notifications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchAllShipments, getShipmentAnalytics } from '@/lib/actions/shipment.actions'
import { Skeleton } from '@/components/ui/skeleton'

const ShipmentManagementPage = async () => {
  const [shipments, analytics] = await Promise.all([
    fetchAllShipments(),
    getShipmentAnalytics()
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading title="Shipment Management" description="Track and manage goods in transport" />
        <CreateShipmentDialog />
      </div>
      
      <Separator />
      
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ShipmentDashboard analytics={analytics} />
      </Suspense>
      
      <Tabs defaultValue="shipments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shipments">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ShipmentTable shipments={shipments} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ShipmentAnalytics shipments={shipments} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ShipmentNotifications shipments={shipments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ShipmentManagementPage