import { RequestSalaryClient } from './_components/client';

export default async function RequestSalaryPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RequestSalaryClient />
      </div>
    </div>
  );
}