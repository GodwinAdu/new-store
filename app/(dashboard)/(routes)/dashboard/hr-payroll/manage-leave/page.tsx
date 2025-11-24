import { getLeaveRequests } from '@/lib/actions/hr-payroll.actions';
import { ManageLeaveClient } from './_components/client';

export default async function ManageLeavePage() {
  const requests = await getLeaveRequests();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ManageLeaveClient data={requests} />
      </div>
    </div>
  );
}