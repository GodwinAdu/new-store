'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Star } from 'lucide-react';
import { CellAction } from './cell-action';

export type SupplierColumn = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
  paymentTerms: string;
  category: string;
  joinDate: string;
  lastOrderDate: string;
  website?: string;
  taxId?: string;
  bankAccount?: string;
  creditLimit: number;
  currentBalance: number;
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'default' as const },
    inactive: { label: 'Inactive', variant: 'secondary' as const },
    pending: { label: 'Pending', variant: 'outline' as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
    />
  ));
};

export const columns: ColumnDef<SupplierColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Supplier',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${row.original.name.charAt(0)}`} />
          <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.contactPerson}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Contact',
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3" />
          {row.original.email}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3" />
          {row.original.phone}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        <span className="text-sm">
          {row.original.city}, {row.original.country}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <div className="flex">{getRatingStars(row.original.rating)}</div>
        <span className="text-sm font-medium">{row.original.rating}</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalOrders',
    header: 'Orders',
  },
  {
    accessorKey: 'totalSpent',
    header: 'Total Spent',
    cell: ({ row }) => `GHS ${row.original.totalSpent.toLocaleString()}`,
  },
  {
    accessorKey: 'paymentTerms',
    header: 'Payment Terms',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];