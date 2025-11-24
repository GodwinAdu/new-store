'use client';

import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { createSupplier, updateSupplier } from '@/lib/actions/supplier.actions';
import { SupplierColumn } from './columns';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  category: z.string().min(1, 'Category is required'),
  paymentTerms: z.string().min(1, 'Payment terms is required'),
  website: z.string().optional(),
  taxId: z.string().optional(),
  bankAccount: z.string().optional(),
  creditLimit: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof formSchema>;

interface SupplierModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: SupplierColumn | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit supplier' : 'Create supplier';
  const description = initialData ? 'Edit supplier details.' : 'Add a new supplier';
  const toastMessage = initialData ? 'Supplier updated.' : 'Supplier created.';
  const action = initialData ? 'Save changes' : 'Create';

  const defaultValues = initialData
    ? {
        name: initialData.name,
        contactPerson: initialData.contactPerson,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        city: initialData.city,
        country: initialData.country,
        category: initialData.category,
        paymentTerms: initialData.paymentTerms,
        website: initialData.website || '',
        taxId: initialData.taxId || '',
        bankAccount: initialData.bankAccount || '',
        creditLimit: initialData.creditLimit.toString(),
      }
    : {
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        category: '',
        paymentTerms: '',
        website: '',
        taxId: '',
        bankAccount: '',
        creditLimit: '',
      };

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      setLoading(true);
      
      const supplierData = {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        category: data.category,
        paymentTerms: data.paymentTerms,
        website: data.website,
        taxId: data.taxId,
        bankAccount: data.bankAccount,
        creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : 0,
      };

      if (initialData) {
        await updateSupplier(initialData.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }

      router.refresh();
      toast.success(toastMessage);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      description={description}
      isOpen={open}
      onClose={onClose}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="email@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="+233 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Poultry Supplier">Poultry Supplier</SelectItem>
                        <SelectItem value="Premium Supplier">Premium Supplier</SelectItem>
                        <SelectItem value="Local Supplier">Local Supplier</SelectItem>
                        <SelectItem value="Feed Supplier">Feed Supplier</SelectItem>
                        <SelectItem value="Equipment Supplier">Equipment Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="www.company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="TAX-123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={loading} placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button disabled={loading} variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={loading} type="submit">
                {action}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};