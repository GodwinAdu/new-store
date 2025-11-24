'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { AwardModal } from './award-modal';
import { CellAction } from './cell-action';
import Heading from '@/components/commons/Header';
import { DataTable } from '@/components/table/data-table';

type Award = {
  id: string;
  staffName: string;
  title: string;
  description: string;
  awardDate: string;
  amount: number;
};

interface AwardsClientProps {
  data: Award[];
  staff: any[];
}

export const AwardsClient: React.FC<AwardsClientProps> = ({ data, staff }) => {
  const [open, setOpen] = useState(false);

  const columns: ColumnDef<Award>[] = [
    {
      accessorKey: 'staffName',
      header: 'Staff Name',
    },
    {
      accessorKey: 'title',
      header: 'Award Title',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: 'awardDate',
      header: 'Award Date',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => row.original.amount ? `GHS ${row.original.amount.toLocaleString()}` : 'N/A',
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Awards (${data.length})`} description="Manage staff awards and recognition" />
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Award
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="staffName" columns={columns} data={data} />
      <AwardModal open={open} onClose={() => setOpen(false)} staff={staff} />
    </>
  );
};