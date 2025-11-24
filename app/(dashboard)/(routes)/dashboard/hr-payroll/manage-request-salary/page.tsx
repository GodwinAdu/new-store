import { getSalaryRequests } from '@/lib/actions/hr-payroll.actions';
import { ManageSalaryRequestClient } from './_components/client';

export default async function ManageSalaryRequestPage() {
  const requests = await getSalaryRequests();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ManageSalaryRequestClient data={requests} />
      </div>
    </div>
  );
}