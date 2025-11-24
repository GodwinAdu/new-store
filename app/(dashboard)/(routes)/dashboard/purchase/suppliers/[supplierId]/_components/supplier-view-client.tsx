'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Globe, CreditCard, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SupplierModal } from '../../_components/supplier-modal';

interface SupplierViewClientProps {
  supplier: any;
}

export function SupplierViewClient({ supplier }: SupplierViewClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">Supplier Details</p>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{supplier.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
              <p>{supplier.contactPerson}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p>{supplier.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className={getStatusColor(supplier.status)}>
                {supplier.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rating</label>
              <div className="flex items-center space-x-1">
                {renderStars(supplier.rating)}
                <span className="text-sm text-muted-foreground ml-2">({supplier.rating}/5)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{supplier.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p>{supplier.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p>{supplier.address}</p>
                <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.country}</p>
              </div>
            </div>
            {supplier.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <p className="text-blue-600 hover:underline">
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                      {supplier.website}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
              <p>{supplier.paymentTerms}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
              <p className="font-medium">${supplier.creditLimit?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
              <p className="font-medium">${supplier.currentBalance?.toLocaleString() || '0'}</p>
            </div>
            {supplier.taxId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                <p>{supplier.taxId}</p>
              </div>
            )}
            {supplier.bankAccount && (
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bank Account</label>
                  <p>{supplier.bankAccount}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Order Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Orders</label>
              <p className="text-2xl font-bold">{supplier.totalOrders || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
              <p className="text-2xl font-bold text-green-600">${supplier.totalSpent?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Join Date</label>
              <p>{new Date(supplier.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Order</label>
              <p>{new Date(supplier.lastOrderDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SupplierModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={supplier}
      />
    </div>
  );
}