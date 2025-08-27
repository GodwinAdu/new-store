# Shipment Management System

## Overview

The Shipment Management System is a comprehensive solution for tracking goods during transport from origin to destination warehouses. It provides real-time tracking, quality control, and advanced analytics for efficient logistics management.

## Features

### 🚚 Core Functionality
- **Shipment Creation**: Create detailed shipments with multiple items, special requirements, and routing information
- **Real-time Tracking**: GPS-based location tracking with history and route visualization
- **Status Management**: Track shipments through their lifecycle (pending → in-transit → delivered)
- **Quality Control**: Perform quality checks upon delivery with issue tracking and approval workflow

### 📊 Advanced Analytics
- **Performance Metrics**: Delivery rates, on-time performance, and trend analysis
- **Value Tracking**: Total shipment values and average shipment worth
- **Priority Distribution**: Analysis of shipment priorities and their performance
- **Special Requirements**: Temperature-controlled and insured shipment tracking

### 🔔 Smart Notifications
- **Overdue Alerts**: Automatic notifications for delayed deliveries
- **Temperature Monitoring**: Alerts for temperature-sensitive shipments
- **Quality Check Reminders**: Notifications for required quality inspections
- **Location Updates**: Alerts for missing location updates

### 🌡️ Special Requirements
- **Temperature Control**: Monitor and track temperature-sensitive goods
- **Insurance Coverage**: Track insured shipments with value protection
- **Priority Handling**: Urgent, high, medium, and low priority classifications
- **Document Management**: Attach documents and photos to shipments

## Database Schema

### Shipment Model
```typescript
{
  shipmentNumber: string (unique)
  trackingNumber: string (unique)
  originWarehouse: ObjectId (ref: Warehouse)
  destinationWarehouse: ObjectId (ref: Warehouse)
  transportId: ObjectId (ref: Transport)
  items: [ShipmentItem]
  status: enum ["pending", "in-transit", "delivered", "cancelled", "delayed", "damaged"]
  priority: enum ["low", "medium", "high", "urgent"]
  scheduledPickupDate: Date
  estimatedDeliveryDate: Date
  currentLocation: LocationUpdate
  locationHistory: [LocationUpdate]
  temperatureRequired: boolean
  qualityCheck: QualityCheckInfo
  // ... additional fields
}
```

### ShipmentItem Schema
```typescript
{
  productId: ObjectId (ref: Product)
  quantity: number
  unitPrice: number
  totalValue: number
  condition: enum ["excellent", "good", "damaged"]
  batchNumber: string (optional)
  expiryDate: Date (optional)
}
```

## API Endpoints

### Shipment Actions
- `createShipment(shipmentData)` - Create new shipment
- `fetchAllShipments()` - Get all shipments with filters
- `fetchShipmentById(id)` - Get detailed shipment information
- `updateShipmentStatus(id, status, notes)` - Update shipment status
- `updateShipmentLocation(id, locationData)` - Update current location
- `performQualityCheck(id, qualityData)` - Perform quality inspection
- `getShipmentAnalytics()` - Get performance analytics

## Components

### Main Components
- **ShipmentDashboard**: Overview with key metrics and recent shipments
- **ShipmentTable**: Data table with filtering, sorting, and actions
- **CreateShipmentDialog**: Comprehensive form for creating shipments
- **ShipmentDetailsDialog**: Detailed view of shipment information
- **TrackingDialog**: Real-time location tracking and updates
- **UpdateStatusDialog**: Status change with validation and warnings
- **QualityCheckDialog**: Quality inspection with issue tracking
- **ShipmentAnalytics**: Advanced analytics and performance metrics
- **ShipmentNotifications**: Real-time alerts and notifications

### Key Features by Component

#### CreateShipmentDialog
- Multi-item shipment creation
- Warehouse and transport selection
- Special requirements (temperature, insurance)
- Priority and scheduling settings
- Form validation with Zod schema

#### TrackingDialog
- Current location display
- Location history timeline
- GPS coordinate input
- Manual location updates
- Map integration placeholder

#### QualityCheckDialog
- Item-by-item inspection
- Issue tracking and documentation
- Approval/rejection workflow
- Quality check history

#### ShipmentAnalytics
- Performance KPIs
- Trend analysis
- Priority distribution
- Special requirements tracking
- Visual progress indicators

#### ShipmentNotifications
- Real-time alert generation
- Priority-based sorting
- Dismissible notifications
- Auto-refresh every minute
- Multiple alert types

## Usage Examples

### Creating a Shipment
```typescript
const shipmentData = {
  originWarehouse: "warehouse_id_1",
  destinationWarehouse: "warehouse_id_2",
  transportId: "transport_id_1",
  items: [
    {
      productId: "product_id_1",
      quantity: 10,
      unitPrice: 25.00,
      condition: "excellent"
    }
  ],
  scheduledPickupDate: new Date(),
  estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  priority: "high",
  temperatureRequired: true,
  minTemperature: 2,
  maxTemperature: 8
}

await createShipment(shipmentData, "/dashboard/transport/shipment-management")
```

### Updating Location
```typescript
await updateShipmentLocation(shipmentId, {
  latitude: 40.7128,
  longitude: -74.0060,
  address: "New York, NY",
  notes: "Stopped for fuel"
})
```

### Performing Quality Check
```typescript
await performQualityCheck(shipmentId, {
  results: "All items in excellent condition",
  issues: ["Minor packaging damage on item 3"],
  approved: true
})
```

## Notification Types

### Alert Categories
1. **Urgent**: Temperature alerts, damaged shipments, overdue deliveries
2. **High**: Delayed shipments, approaching deliveries
3. **Medium**: Quality checks required, successful deliveries
4. **Low**: General updates and information

### Auto-Generated Alerts
- Delivery overdue (past estimated delivery time)
- Delivery approaching (within 2 hours)
- Temperature out of range
- Location update missing (4+ hours)
- Quality check required
- Shipment status changes

## Performance Features

### Database Optimization
- Indexed fields for fast queries
- Efficient population of related documents
- Optimized aggregation pipelines

### Real-time Updates
- Auto-refresh notifications
- Live status tracking
- Dynamic analytics updates

### User Experience
- Responsive design
- Loading states and skeletons
- Error handling and validation
- Intuitive navigation

## Integration Points

### External Services
- GPS/Location services
- Map providers (Google Maps, Mapbox)
- Temperature sensors
- Notification services (SMS, email)
- Document storage

### Internal Systems
- Warehouse management
- Inventory tracking
- Transport scheduling
- User authentication
- Audit logging

## Security Considerations

- User authentication required for all operations
- Role-based access control
- Audit trail for all changes
- Secure document handling
- Data validation and sanitization

## Future Enhancements

### Planned Features
- Mobile app for drivers
- Barcode/QR code scanning
- Automated notifications (SMS/Email)
- Route optimization
- Predictive analytics
- Integration with IoT sensors
- Customer tracking portal
- Advanced reporting and exports

### Technical Improvements
- WebSocket for real-time updates
- Offline capability
- Advanced caching
- Performance monitoring
- Automated testing
- CI/CD pipeline

## Getting Started

1. Ensure all dependencies are installed
2. Set up MongoDB connection
3. Configure authentication
4. Run database migrations
5. Start the development server
6. Navigate to `/dashboard/transport/shipment-management`

The system is now ready for comprehensive shipment tracking and management!