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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { createLeaveRequest } from '@/lib/actions/hr-payroll.actions';
import Heading from '@/components/commons/Header';

const formSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export const RequestLeaveClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate < startDate) {
        toast.error('End date must be after start date');
        return;
      }
      
      await createLeaveRequest(data);

      toast.success('Leave request submitted successfully');
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
        title="Request Leave"
        description="Submit a leave request"
      />
      <Separator />
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Leave Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="annual-leave">Annual Leave</SelectItem>
                        <SelectItem value="sick-leave">Sick Leave</SelectItem>
                        <SelectItem value="maternity-leave">Maternity Leave</SelectItem>
                        <SelectItem value="paternity-leave">Paternity Leave</SelectItem>
                        <SelectItem value="emergency-leave">Emergency Leave</SelectItem>
                        <SelectItem value="study-leave">Study Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
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
              </div>
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={loading}
                        placeholder="Explain the reason for your leave request..."
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