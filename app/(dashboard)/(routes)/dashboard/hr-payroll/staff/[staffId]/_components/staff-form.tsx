'use client';

import * as z from 'zod';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertModal } from '@/components/modals/alert-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { updateStaff, deleteStaff, getDepartments, getRoles } from '@/lib/actions/staff.actions';
import Heading from '@/components/commons/Header';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  emergencyNumber: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  departmentId: z.string().min(1, 'Department is required'),
  jobTitle: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  dob: z.string().optional(),
  startDate: z.string().optional(),
  workLocation: z.enum(['on-site', 'remote', 'hybrid']).optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  idCardType: z.string().optional(),
  idCardNumber: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface StaffFormProps {
  initialData: any;
}

export const StaffForm: React.FC<StaffFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const title = 'Edit staff';
  const description = 'Edit staff member details';
  const toastMessage = 'Staff updated.';
  const action = 'Save changes';

  const defaultValues = {
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    emergencyNumber: initialData?.emergencyNumber || '',
    role: initialData?.role || '',
    departmentId: initialData?.departmentId?._id || '',
    jobTitle: initialData?.jobTitle || '',
    gender: initialData?.gender || 'prefer-not-to-say',
    dob: initialData?.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    workLocation: initialData?.workLocation || 'on-site',
    bio: initialData?.bio || '',
    isActive: initialData?.isActive ?? true,
    street: initialData?.address?.street || '',
    city: initialData?.address?.city || '',
    state: initialData?.address?.state || '',
    country: initialData?.address?.country || '',
    zipCode: initialData?.address?.zipCode || '',
    idCardType: initialData?.cardDetails?.idCardType || '',
    idCardNumber: initialData?.cardDetails?.idCardNumber || '',
    accountName: initialData?.accountDetails?.accountName || '',
    accountNumber: initialData?.accountDetails?.accountNumber || '',
    accountType: initialData?.accountDetails?.accountType || '',
  };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptData, roleData] = await Promise.all([
          getDepartments(),
          getRoles()
        ]);
        setDepartments(deptData);
        setRoles(roleData);
      } catch (error) {
        toast.error('Failed to load form data');
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: StaffFormValues) => {
    try {
      setLoading(true);
      
      const staffData = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        emergencyNumber: data.emergencyNumber,
        role: data.role,
        departmentId: data.departmentId,
        jobTitle: data.jobTitle,
        gender: data.gender,
        dob: data.dob,
        startDate: data.startDate,
        workLocation: data.workLocation,
        bio: data.bio,
        isActive: data.isActive,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        },
        cardDetails: {
          idCardType: data.idCardType,
          idCardNumber: data.idCardNumber,
        },
        accountDetails: {
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
        },
      };

      console.log(staffData,"tesitn data")

      await updateStaff(params.staffId as string, staffData);
      router.refresh();
      router.push('/dashboard/hr/staff');
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteStaff(params.staffId as string);
      router.refresh();
      router.push('/dashboard/hr/staff');
      toast.success('Staff deleted.');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
              <div className="grid grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="John Doe" {...field} />
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
                        <Input disabled={loading} placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role.displayName}>
                              {role.displayName}
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
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                              {dept.name}
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
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              
              <div className="grid grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="123 Main St" {...field} />
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
                        <Input disabled={loading} placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="NY" {...field} />
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
                        <Input disabled={loading} placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idCardType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Card Type</FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID card type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="voters-id">Voters ID</SelectItem>
                          <SelectItem value="driving-license">Driving License</SelectItem>
                          <SelectItem value="ghana-card">Ghana Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idCardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Card Number</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="ID number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Account holder name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="momo">MoMo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This staff member is active and can access the system.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <Button disabled={loading} className="ml-auto" type="submit">
                {action}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};