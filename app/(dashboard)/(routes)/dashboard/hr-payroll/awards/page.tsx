import { getAwards } from '@/lib/actions/hr-payroll.actions';
import { getAllStaff } from '@/lib/actions/staff.actions';
import { AwardsClient } from './_components/client';

export default async function AwardsPage() {
  const [awards, staff] = await Promise.all([
    getAwards(),
    getAllStaff()
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AwardsClient data={awards} staff={staff} />
      </div>
    </div>
  );
}