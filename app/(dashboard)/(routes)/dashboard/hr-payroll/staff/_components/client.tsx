'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { columns, StaffColumn } from './columns';
import { StaffModal } from './staff-modal';
import { DataTable } from '@/components/table/data-table';
import Heading from '@/components/commons/Header';

interface StaffClientProps {
  data: StaffColumn[];
  stats: {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    onLeave: number;
  };
}

export const StaffClient: React.FC<StaffClientProps> = ({ data, stats }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Staff (${data.length})`} description="Manage your staff members" />
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactiveStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.onLeave}</div>
          </CardContent>
        </Card>
      </div>

      <Separator />
      <DataTable searchKey="fullName" columns={columns} data={data} />
      <StaffModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};