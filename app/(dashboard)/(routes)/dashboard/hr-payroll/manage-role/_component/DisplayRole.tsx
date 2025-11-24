"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CreateRoleSchema } from "@/lib/validators/role.validator";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import * as z from "zod";


type DisplayRoleProps = {
  initialData:IRole
}

const DisplayRole = ({ initialData }: DisplayRoleProps) => {

  const form = useForm<z.infer<typeof CreateRoleSchema>>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: initialData
  });



  return (
    <>
      <div className="">
        <Form {...form}>
          <form className="space-y-8">
            <Card className="w-full h-full">
              <CardContent>
                <div className="flex justify-between items-center gap-4 py-2">
                  <div className="">
                    <div className="font-bold text-md">{initialData.displayName} Role</div>
                  </div>
                </div>
                <div className="px-2 md:px-5 ">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-5">
                    <div>
                      <h1 className="font-bold">Name</h1>
                      <p className="italic">{initialData.name}</p>
                    </div>
                    <div>
                      <h1 className="font-bold">Display Name</h1>
                      <p className="italic">{initialData.displayName}</p>
                    </div>
                    <div>
                      <h1 className="font-bold">Description</h1>
                      <p className="italic">{initialData.description}</p>
                    </div>
                  </div>

                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    GLOBAL ACCESS
                  </h1>
                  <div className="flex gap-4 py-3">
                    <FormField
                      name="manageSchool"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage School</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageAccess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage Access</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs  bg-black/80 p-0.5">
                    MANAGEMENT ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="schoolInfo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View School info</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="systemConfig"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View System config</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="frontendManagement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Frontend management</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageUsers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage User</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transferStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Transfer student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageTimeTable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Time Table</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repeatStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Repeat Student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="examsManagement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Exams Management</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryAndPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Salary & Payment</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="feesAndPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Fees & Payment</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="library"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Library management</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs  bg-black/80 p-0.5">
                    DASHBOARD ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="dashboard"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Dashboard</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewChart"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View chart on dashboard</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewMemberTab"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View members tab on dashboard</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewEnquiries"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              View enquiries tab on dashboard
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewExpenses"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              View expenses tab on dashboard
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    ROLES ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addRole"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add roles</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewRole"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Role details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editRole"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Edit role details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteRole"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Delete roles</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageRole"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage roles</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    TERM ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addTerm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Add Term</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewTerm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Term details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editTerm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Term details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteTerm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Term details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageTerm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Term</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SESSION ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSession"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Add Session</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSession"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Session details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSession"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Session</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSession"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Session</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSession"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Session</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    ClASS ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Class</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Classes</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Class details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Class</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Class</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SUBJECT ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSubject"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Subject</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSubject"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Subjects</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSubject"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Subject</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSubject"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Able Delete Subject</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSubject"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Subject</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    LEVEL ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addLevel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Add Level</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewLevel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Levels</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editLevel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Level</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteLevel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Levels</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageLevel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Level</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    DAYS ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Create Days</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Days</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Days details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Days</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Days</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    TIME ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Time</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Time details</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Time</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Time</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Time</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    CLASSROOMS ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addClassroom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Create New Classrooms</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewClassroom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Classroom</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editClassroom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Classroom</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteClassroom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Classroom</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageClassroom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Classrooms</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    CLASS SECTIONS ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addClassSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Class Sections</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewClassSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Class Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editClassSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Class Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteClassSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Class Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageClassSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Class Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SCHOOL HOUSES ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSchoolHouse"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add School House</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSchoolHouse"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View School House</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSchoolHouse"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit School House</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSchoolHouse"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete School house</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSchoolHouse"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage School House</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SCHOOL SECTION ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addPlotSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Plot Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewPlotSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Plot Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editPlotSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Plot Sections</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deletePlotSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Plot Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="managePlotSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Plot Section</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    GRADING SYSTEM ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addGradingSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Creating Grading System</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewGradingSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Grading System</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editGradingSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Grading System</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteGradingSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Grading System</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageGradingSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Grading System</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    PUBLISH RESULT ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="publishResult"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Publish Result</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SCHOOL EVENT ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSchoolEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add School Event</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSchoolEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View School Event</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSchoolEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit School Event</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSchoolEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete School Event</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSchoolEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage School Event</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SCHOOL BANNER ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSchoolBanner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Create School Banner</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSchoolBanner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View School Banner</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSchoolBanner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit School Banner</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSchoolBanner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete School Banner</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSchoolBanner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage School Banner</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    MANAGE ADMIN ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Admin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Admin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Admin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Admin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Admin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    MANAGE TEACHER ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addTeacher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Teacher</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewTeacher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Teacher</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editTeacher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Teacher</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteTeacher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Teacher</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageTeacher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Teacher</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    MANAGE STUDENT ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Student</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    STUDENT ATTENDANCE ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addStudentAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Student Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewStudentAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Student Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editStudentAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel> Edit Student Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteStudentAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel> Delete Student Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageTeacherAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel> Manage Student Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    TEACHER ATTENDANCE ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addTeacherAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Teacher Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewTeacherAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Teacher Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editTeacherAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel> Edit Teacher Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteTeacherAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel> Delete Teacher Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageTeacherAttendance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel> Manage Teacher Attendance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SALARY STRUCTURE ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSalaryStructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Salary Structure</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSalaryStructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Salary Structure</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSalaryStructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Salary Structure</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSalaryStructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Salary Structure</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSalaryStructure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Salary Structure</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    SALARY PAYMENT ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addSalaryPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Salary Payment</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewSalaryPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Salary Payment</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSalaryPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Salary Payment</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteSalaryPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Salary Payment</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageSalaryPayment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Salary Payments</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    MANAGE BOOKS ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Books</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <h1 className="text-white text-xs bg-black/80 p-0.5">
                    ISSUE BOOK ACCESS
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
                    <FormField
                      control={form.control}
                      name="addIssueBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Issue Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="viewIssueBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Issue books</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editIssueBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Edit Issues Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deleteIssueBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Delete Issue Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageIssueBook"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                          <FormControl>
                            <Checkbox
                              disabled
                              className="cursor-not-allowed opacity-50"
                              checked={field.value}

                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Manage Issue Book</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </>
  );
};

export default DisplayRole;
