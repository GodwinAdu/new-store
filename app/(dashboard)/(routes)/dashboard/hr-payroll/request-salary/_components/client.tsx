'use client';

import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { createSalaryRequest } from '@/lib/actions/hr-payroll.actions';
import Heading from '@/components/commons/Header';

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  requestDate: z.string().min(1, 'Request date is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const RequestSalaryClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      reason: '',
      requestDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      await createSalaryRequest({
        amount: parseFloat(data.amount),
        reason: data.reason,
        requestDate: data.requestDate,
      });

      toast.success('Salary request submitted successfully');
      form.reset();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading
        title="Request Salary"
        description="Submit a salary advance request"
      />
      <Separator />
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Salary Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (GHS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={loading}
                        placeholder="Explain why you need this salary advance..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button disabled={loading} type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};