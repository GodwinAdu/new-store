'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';

export type StaffColumn = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  jobTitle: string;
  isActive: boolean;
  onLeave: boolean;
  createdAt: string;
};

export const columns: ColumnDef<StaffColumn>[] = [
  {
    accessorKey: 'fullName',
    header: 'Full Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => row.original.phoneNumber || 'N/A',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'jobTitle',
    header: 'Job Title',
    cell: ({ row }) => row.original.jobTitle || 'N/A',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      const onLeave = row.original.onLeave;
      
      if (onLeave) {
        return <Badge variant="secondary">On Leave</Badge>;
      }
      
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];