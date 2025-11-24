import { RequestLeaveClient } from './_components/client';

export default async function RequestLeavePage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RequestLeaveClient />
      </div>
    </div>
  );
}