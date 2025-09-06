'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, DollarSign, Calendar, Users, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { getSalaryPayments, generateMonthlyPayroll, processSalaryPayment, updateSalaryPayment } from '@/lib/actions/salary.actions';

interface SalaryPayment {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
    position: string;
  };
  payPeriod: {
    month: number;
    year: number;
  };
  basicSalary: number;
  allowances: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  paymentDate?: Date;
  status: string;
  paymentMethod: string;
  notes?: string;
}

export default function SalaryPaymentPage() {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [generateData, setGenerateData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, statusFilter, monthFilter, yearFilter]);

  const loadPayments = async () => {
    try {
      const data = await getSalaryPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load salary payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payPeriod.month === parseInt(monthFilter));
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payPeriod.year === parseInt(yearFilter));
    }

    setFilteredPayments(filtered);
  };

  const handleGeneratePayroll = async () => {
    try {
      await generateMonthlyPayroll(generateData.month, generateData.year);
      setShowGenerateDialog(false);
      loadPayments();
    } catch (error) {
      console.error('Failed to generate payroll:', error);
    }
  };

  const handleProcessPayment = async (paymentId: string) => {
    try {
      await processSalaryPayment(paymentId);
      loadPayments();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const handleUpdatePayment = async (paymentId: string, updates: any) => {
    try {
      await updateSalaryPayment(paymentId, updates);
      setShowPaymentDialog(false);
      setSelectedPayment(null);
      loadPayments();
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const totalPending = filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netSalary, 0);
  const totalPaid = filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netSalary, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Salary Payments</h1>
            <p className="text-gray-600">Process and manage employee salary payments</p>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex gap-4">
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Payments</h1>
          <p className="text-gray-600">Process and manage employee salary payments</p>
        </div>
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Payroll
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Monthly Payroll</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Month</label>
                  <Select value={generateData.month.toString()} onValueChange={(value) => 
                    setGenerateData({...generateData, month: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    type="number"
                    value={generateData.year}
                    onChange={(e) => setGenerateData({...generateData, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button onClick={handleGeneratePayroll} className="w-full">
                Generate Payroll
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.status === 'pending').length} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.status === 'paid').length} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(filteredPayments.map(p => p.employee._id)).size}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({length: 12}, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {getMonthName(i + 1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No salary payments found</h3>
            <p className="text-gray-500 mb-4">Generate payroll to create salary payments</p>
            <Button onClick={() => setShowGenerateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Payroll
            </Button>
          </div>
        ) : (
          filteredPayments.map((payment) => (
          <Card key={payment._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {payment.employee.firstName} {payment.employee.lastName}
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee ID:</span>
                  <span className="text-sm font-medium">{payment.employee.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm font-medium">{payment.employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pay Period:</span>
                  <span className="text-sm font-medium">
                    {getMonthName(payment.payPeriod.month)} {payment.payPeriod.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Basic Salary:</span>
                  <span className="text-sm font-medium">${payment.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Salary:</span>
                  <span className="text-sm font-medium">${payment.grossSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Salary:</span>
                  <span className="text-sm font-bold text-green-600">${payment.netSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{payment.status}</span>
                  </Badge>
                </div>
                {payment.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {payment.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleProcessPayment(payment._id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pay
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowPaymentDialog(true);
                    }}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Payment Details - {selectedPayment?.employee.firstName} {selectedPayment?.employee.lastName}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Employee Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">ID:</span> {selectedPayment.employee.employeeId}</p>
                    <p><span className="text-gray-600">Department:</span> {selectedPayment.employee.department}</p>
                    <p><span className="text-gray-600">Position:</span> {selectedPayment.employee.position}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Period:</span> {getMonthName(selectedPayment.payPeriod.month)} {selectedPayment.payPeriod.year}</p>
                    <p><span className="text-gray-600">Method:</span> {selectedPayment.paymentMethod}</p>
                    <p><span className="text-gray-600">Status:</span> {selectedPayment.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Allowances</h4>
                  <div className="space-y-1 text-sm">
                    {selectedPayment.allowances.map((allowance, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{allowance.name}:</span>
                        <span>${allowance.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Total:</span>
                      <span>${selectedPayment.totalAllowances.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Deductions</h4>
                  <div className="space-y-1 text-sm">
                    {selectedPayment.deductions.map((deduction, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{deduction.name}:</span>
                        <span>${deduction.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Total:</span>
                      <span>${selectedPayment.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span>${selectedPayment.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allowances:</span>
                    <span className="text-green-600">+${selectedPayment.totalAllowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span className="text-red-600">-${selectedPayment.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Net Salary:</span>
                    <span className="text-green-600">${selectedPayment.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleProcessPayment(selectedPayment._id)}
                    className="flex-1"
                  >
                    Process Payment
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdatePayment(selectedPayment._id, { status: 'cancelled' })}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}