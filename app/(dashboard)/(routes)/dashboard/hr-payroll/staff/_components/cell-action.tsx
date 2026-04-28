'use client';

import { useState } from 'react';
import { Edit, MoreHorizontal, Trash, Eye, UserX, UserCheck, Ban, Key, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/modals/alert-modal';

import { StaffColumn } from './columns';
import { deleteStaff, toggleStaffStatus, toggleStaffLeave, banStaff, resetStaffPassword } from '@/lib/actions/staff.actions';
import { StaffModal } from './staff-modal';

interface CellActionProps {
  data: StaffColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteStaff(data.id);
      toast.success('Staff deleted.');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await toggleStaffStatus(data.id, !data.isActive);
      toast.success(`Staff ${data.isActive ? 'deactivated' : 'activated'} successfully`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLeave = async () => {
    try {
      setLoading(true);
      await toggleStaffLeave(data.id, !data.onLeave);
      toast.success(`Staff ${data.onLeave ? 'returned from' : 'marked on'} leave`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update leave status');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    try {
      setLoading(true);
      await banStaff(data.id);
      toast.success('Staff banned successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to ban staff');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const tempPassword = 'Password123!';
      await resetStaffPassword(data.id, tempPassword);
      toast.success(`Password reset. Temp password: ${tempPassword}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <StaffModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={data}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/hr/staff/${data.id}`)}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleToggleStatus}>
            {data.isActive ? (
              <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
            ) : (
              <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleToggleLeave}>
            {data.onLeave ? (
              <><Calendar className="mr-2 h-4 w-4" /> Return from Leave</>
            ) : (
              <><Calendar className="mr-2 h-4 w-4" /> Mark on Leave</>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleResetPassword}>
            <Key className="mr-2 h-4 w-4" /> Reset Password
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleBan} className="text-orange-600">
            <Ban className="mr-2 h-4 w-4" /> Ban Staff
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};