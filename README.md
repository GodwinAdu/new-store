# Modern POS System 🚀

A comprehensive, modern Point of Sale (POS) system built with Next.js 15, React 19, TypeScript, and advanced features for retail businesses, restaurants, and service providers.

## ✨ Key Features

### 🛒 Advanced Point of Sale
- **Modern Interface**: Clean, responsive design with dark/light theme
- **Smart Product Search**: Real-time search with barcode scanning
- **Multi-Payment Support**: Cash, Card, and Mobile payments
- **Real-time Analytics**: Live sales metrics and performance tracking
- **Receipt Management**: Professional receipts with print/email options

### 👥 Customer Management
- **Customer Profiles**: Detailed customer information and history
- **Loyalty Program**: Points-based system with tier management (Bronze, Silver, Gold, Platinum)
- **Purchase History**: Complete transaction tracking
- **Preferences**: Customer notes and preferences management

### 📦 Inventory Control
- **Real-time Stock Tracking**: Live inventory levels with low stock alerts
- **Product Management**: Complete product catalog with categories
- **Restock Management**: Quick restock functionality with supplier tracking
- **Batch Management**: FIFO inventory system with cost tracking

### 📊 Analytics & Reporting
- **Sales Dashboard**: Comprehensive analytics with charts and metrics
- **Transaction Reports**: Detailed sales reports with export options
- **Product Performance**: Top-selling products and revenue analysis
- **Payment Analytics**: Payment method breakdown and trends
- **Custom Date Ranges**: Flexible reporting periods

### 🎯 Business Features
- **Multi-location Support**: Manage multiple store locations
- **Role-based Access**: Admin, Manager, Cashier permissions
- **Tax Management**: Configurable tax rates and calculations
- **Discount System**: Percentage and fixed amount discounts
- **Offline Mode**: Basic functionality without internet

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based secure authentication
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB database
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd new-pos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

### Access the Application

Open [http://localhost:3000](http://localhost:3000) to view the application.

- **POS Interface**: `/pos` - Main point of sale interface
- **Dashboard**: `/dashboard` - Analytics and management
- **Admin Panel**: Various admin routes for system management

## 📱 Usage Guide

### Daily Operations
1. **Start POS**: Navigate to `/pos` to begin sales operations
2. **Process Sales**: Add products to cart, apply discounts, process payments
3. **Manage Customers**: Add new customers, apply loyalty points
4. **Monitor Inventory**: Check stock levels, restock products
5. **View Reports**: Access analytics and generate sales reports

### Key Workflows
- **New Sale**: Search products → Add to cart → Select customer → Process payment → Print receipt
- **Customer Management**: Search customer → View profile → Update information → Manage loyalty points
- **Inventory**: View stock → Check alerts → Restock items → Update suppliers
- **Reporting**: Select date range → Choose report type → Export data

## 🏗 Project Structure

```
new-pos/
├── app/                    # Next.js app directory
│   ├── (pos)/             # POS interface routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── pos/              # POS-specific components
│   ├── ui/               # UI components (Radix)
│   └── commons/          # Shared components
├── lib/                   # Utilities and configurations
│   ├── models/           # Database models
│   ├── actions/          # Server actions
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

## 🔧 Configuration

### Store Settings
- Configure business information in the admin panel
- Set up tax rates and payment methods
- Customize receipt templates and branding
- Manage user roles and permissions

### Hardware Integration
- **Receipt Printers**: Compatible with thermal printers
- **Barcode Scanners**: USB and Bluetooth scanner support
- **Cash Drawers**: Automatic drawer opening
- **Card Readers**: Payment terminal integration

## 📊 Features Overview

### Point of Sale Interface
- Product grid with categories and search
- Shopping cart with quantity controls
- Customer selection and loyalty integration
- Multiple payment methods (Cash, Card, Mobile)
- Real-time order calculations with tax and discounts
- Receipt generation and printing

### Analytics Dashboard
- Today's sales metrics and trends
- Hourly sales breakdown
- Top-selling products analysis
- Customer insights and retention
- Payment method distribution

### Inventory Management
- Real-time stock tracking
- Low stock alerts and notifications
- Product catalog management
- Supplier information and restock history
- Batch tracking with FIFO costing

### Customer Management
- Detailed customer profiles
- Loyalty points system with tiers
- Purchase history and preferences
- Customer search and quick selection
- Email integration for receipts

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Data encryption and secure storage
- Input validation and sanitization
- Audit logging for transactions

## 📈 Performance

- Optimized bundle sizes with code splitting
- Server-side rendering for fast initial loads
- Real-time data synchronization
- Offline functionality for basic operations
- Responsive design for all devices

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, feature requests, or bug reports:
- Create an issue in this repository
- Check the [POS_FEATURES.md](POS_FEATURES.md) for detailed documentation

---

**Modern POS System** - Empowering businesses with advanced point-of-sale technology built on modern web standards.
