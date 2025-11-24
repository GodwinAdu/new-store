import { getAllSuppliers, getSupplierStats } from '@/lib/actions/supplier.actions';
import { SuppliersClient } from './_components/client';

export default async function SuppliersPage() {
  const [suppliers, stats] = await Promise.all([
    getAllSuppliers(),
    getSupplierStats()
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SuppliersClient data={suppliers} stats={stats} />
      </div>
    </div>
  );
}