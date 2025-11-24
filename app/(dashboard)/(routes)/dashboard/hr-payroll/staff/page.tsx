import { getAllStaff, getStaffStats } from '@/lib/actions/staff.actions';
import { StaffClient } from './_components/client';

export default async function StaffPage() {
  const [staff, stats] = await Promise.all([
    getAllStaff(),
    getStaffStats()
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StaffClient data={staff} stats={stats} />
      </div>
    </div>
  );
}