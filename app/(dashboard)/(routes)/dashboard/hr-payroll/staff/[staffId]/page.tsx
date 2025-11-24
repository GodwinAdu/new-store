import { getStaffById } from '@/lib/actions/staff.actions';
import { StaffForm } from './_components/staff-form';

export default async function StaffPage({
  params
}: {
  params: Promise<{ staffId: string }>
}) {
  const { staffId } = await params
  const staff = await getStaffById(staffId);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StaffForm initialData={staff} />
      </div>
    </div>
  );
}