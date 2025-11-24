'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { updateSalaryRequestStatus } from '@/lib/actions/hr-payroll.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Heading from '@/components/commons/Header';
import { DataTable } from '@/components/table/data-table';

type SalaryRequest = {
  id: string;
  staffName: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: string;
};

interface ManageSalaryRequestClientProps {
  data: SalaryRequest[];
}

export const ManageSalaryRequestClient: React.FC<ManageSalaryRequestClientProps> = ({ data }) => {
  const router = useRouter();

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await updateSalaryRequestStatus(requestId, status);
      toast.success(`Request ${status} successfully`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const columns: ColumnDef<SalaryRequest>[] = [
    {
      accessorKey: 'staffName',
      header: 'Staff Name',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `GHS ${row.original.amount.toLocaleString()}`,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.reason}>
          {row.original.reason}
        </div>
      ),
    },
    {
      accessorKey: 'requestDate',
      header: 'Request Date',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant={
              status === 'approved' ? 'default' : 
              status === 'rejected' ? 'destructive' : 
              'secondary'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const request = row.original;
        
        if (request.status !== 'pending') {
          return <span className="text-muted-foreground">No actions</span>;
        }
        
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(request.id, 'approved')}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate(request.id, 'rejected')}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Heading
        title={`Salary Requests (${data.length})`}
        description="Manage staff salary requests"
      />
      <Separator />
      <DataTable searchKey="staffName" columns={columns} data={data} />
    </>
  );
};