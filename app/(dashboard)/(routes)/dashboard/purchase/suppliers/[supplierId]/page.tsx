import { getSupplierById } from '@/lib/actions/supplier.actions';
import { SupplierViewClient } from './_components/supplier-view-client';
import { notFound } from 'next/navigation';

interface SupplierViewPageProps {
  params: {
    supplierId: string;
  };
}

export default async function SupplierViewPage({ params }: SupplierViewPageProps) {
  try {
    const supplier = await getSupplierById(params.supplierId);
    
    if (!supplier) {
      notFound();
    }

    return <SupplierViewClient supplier={supplier} />;
  } catch (error) {
    notFound();
  }
}