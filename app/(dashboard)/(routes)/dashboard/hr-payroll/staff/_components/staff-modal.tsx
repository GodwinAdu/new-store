'use client';

import * as z from 'zod';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';

import { createStaff, updateStaff, getDepartments, getRoles } from '@/lib/actions/staff.actions';
import { StaffColumn } from './columns';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  emergencyNumber: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  departmentId: z.string().min(1, 'Department is required'),
  jobTitle: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  dob: z.string().optional(),
  startDate: z.string().optional(),
  workLocation: z.enum(['on-site', 'remote', 'hybrid']).optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
  availableAllSchedule: z.boolean().default(false),
  workSchedule: z.array(z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
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

interface StaffModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: StaffColumn | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const title = initialData ? 'Edit staff' : 'Create staff';
  const description = initialData ? 'Edit a staff member.' : 'Add a new staff member';
  const toastMessage = initialData ? 'Staff updated.' : 'Staff created.';
  const action = initialData ? 'Save changes' : 'Create';

  const defaultValues = initialData
    ? {
        username: initialData.username || '',
        fullName: initialData.fullName,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber || '',
        emergencyNumber: initialData.emergencyNumber || '',
        role: initialData.role,
        departmentId: '',
        jobTitle: initialData.jobTitle || '',
        isActive: initialData.isActive,
        availableAllSchedule: initialData.availableAllSchedule || false,
        workSchedule: initialData.workSchedule || [],
        gender: initialData.gender || 'prefer-not-to-say' as const,
        dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        workLocation: initialData.workLocation || 'on-site' as const,
        bio: initialData.bio || '',
        street: initialData.address?.street || '',
        city: initialData.address?.city || '',
        state: initialData.address?.state || '',
        country: initialData.address?.country || '',
        zipCode: initialData.address?.zipCode || '',
        idCardType: initialData.cardDetails?.idCardType || '',
        idCardNumber: initialData.cardDetails?.idCardNumber || '',
        accountName: initialData.accountDetails?.accountName || '',
        accountNumber: initialData.accountDetails?.accountNumber || '',
        accountType: initialData.accountDetails?.accountType || '',
      }
    : {
        username: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        emergencyNumber: '',
        role: '',
        departmentId: '',
        jobTitle: '',
        password: '',
        isActive: true,
        availableAllSchedule: false,
        workSchedule: [],
        gender: 'prefer-not-to-say' as const,
        dob: '',
        startDate: '',
        workLocation: 'on-site' as const,
        bio: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        idCardType: '',
        idCardNumber: '',
        accountName: '',
        accountNumber: '',
        accountType: '',
      };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'workSchedule',
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

    if (open) {
      loadData();
    }
  }, [open]);

  const onSubmit = async (data: StaffFormValues) => {
    try {
      setLoading(true);
      
      const staffData = {
        username: data.username,
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
        availableAllSchedule: data.availableAllSchedule,
        workSchedule: data.workSchedule || [],
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

      if (initialData) {
        await updateStaff(initialData.id, staffData);
      } else {
        await createStaff({
          ...staffData,
          password: data.password!,
        });
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
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="emergencyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
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
                              <SelectItem key={role._id} value={role.name}>
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
                  {!initialData && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" disabled={loading} placeholder="Password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Location</FormLabel>
                        <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="on-site">On-site</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-sm font-medium mt-6 mb-4">Work Schedule</h3>
                <FormField
                  control={form.control}
                  name="availableAllSchedule"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Available All Schedule</FormLabel>
                        <p className="text-xs text-muted-foreground">Staff is available for all shifts</p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {!form.watch('availableAllSchedule') && (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`workSchedule.${index}.day`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day</FormLabel>
                              <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Monday">Monday</SelectItem>
                                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                                  <SelectItem value="Thursday">Thursday</SelectItem>
                                  <SelectItem value="Friday">Friday</SelectItem>
                                  <SelectItem value="Saturday">Saturday</SelectItem>
                                  <SelectItem value="Sunday">Sunday</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`workSchedule.${index}.startTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" disabled={loading} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`workSchedule.${index}.endTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" disabled={loading} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ day: 'Monday', startTime: '09:00', endTime: '17:00' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </div>
                )}
                
                <h3 className="text-sm font-medium mt-6 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Input disabled={loading} placeholder="Accra" {...field} />
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
                        <FormLabel>State/Region</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Greater Accra" {...field} />
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
                          <Input disabled={loading} placeholder="Ghana" {...field} />
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
                        <FormLabel>Zip/Postal Code</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="00233" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-sm font-medium mt-6 mb-4">Identification & Banking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormLabel>Bank Account Name</FormLabel>
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
                          <Input disabled={loading} placeholder="Bank account number" {...field} />
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
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <textarea
                            disabled={loading}
                            placeholder="Brief description about the staff member"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active Status</FormLabel>
                        </div>
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
        </div>
      </div>
    </Modal>
  );
};
