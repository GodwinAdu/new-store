'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { updateLeaveRequestStatus } from '@/lib/actions/hr-payroll.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Heading from '@/components/commons/Header';
import { DataTable } from '@/components/table/data-table';

type LeaveRequest = {
  id: string;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
};

interface ManageLeaveClientProps {
  data: LeaveRequest[];
}

export const ManageLeaveClient: React.FC<ManageLeaveClientProps> = ({ data }) => {
  const router = useRouter();

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await updateLeaveRequestStatus(requestId, status);
      toast.success(`Leave request ${status} successfully`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: 'staffName',
      header: 'Staff Name',
    },
    {
      accessorKey: 'leaveType',
      header: 'Leave Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.leaveType}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
    },
    {
      accessorKey: 'days',
      header: 'Days',
      cell: ({ row }) => `${row.original.days} days`,
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
        title={`Leave Requests (${data.length})`}
        description="Manage staff leave requests"
      />
      <Separator />
      <DataTable searchKey="staffName" columns={columns} data={data} />
    </>
  );
};