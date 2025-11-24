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
import { Textarea } from '@/components/ui/textarea';

import { createAward } from '@/lib/actions/hr-payroll.actions';

const formSchema = z.object({
  staffId: z.string().min(1, 'Staff selection is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  awardDate: z.string().min(1, 'Award date is required'),
  amount: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AwardModalProps {
  open: boolean;
  onClose: () => void;
  staff: any[];
}

export const AwardModal: React.FC<AwardModalProps> = ({
  open,
  onClose,
  staff,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: '',
      title: '',
      description: '',
      awardDate: new Date().toISOString().split('T')[0],
      amount: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      await createAward({
        staffId: data.staffId,
        title: data.title,
        description: data.description,
        awardDate: data.awardDate,
        amount: data.amount ? parseFloat(data.amount) : undefined,
      });

      router.refresh();
      toast.success('Award created successfully');
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Award"
      description="Give recognition to outstanding staff members"
      isOpen={open}
      onClose={onClose}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Award Title</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Employee of the Month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Describe the achievement or reason for this award..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="awardDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Award Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0.00"
                        {...field}
                      />
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
                Create Award
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};