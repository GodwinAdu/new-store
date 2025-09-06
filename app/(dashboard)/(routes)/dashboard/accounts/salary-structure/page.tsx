'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';
import { getSalaryStructures, createSalaryStructure, updateSalaryStructure, deleteSalaryStructure } from '@/lib/actions/salary.actions';

interface SalaryStructure {
  _id: string;
  title: string;
  department: string;
  position: string;
  basicSalary: number;
  allowances: Array<{ name: string; amount: number; type: string }>;
  deductions: Array<{ name: string; amount: number; type: string }>;
  totalSalary: number;
  status: string;
}

export default function SalaryStructurePage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    position: '',
    basicSalary: 0,
    allowances: [{ name: '', amount: 0, type: 'fixed' }],
    deductions: [{ name: '', amount: 0, type: 'fixed' }],
    status: 'active'
  });

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      const data = await getSalaryStructures();
      setStructures(data);
    } catch (error) {
      console.error('Failed to load salary structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingStructure) {
        await updateSalaryStructure(editingStructure._id, formData);
      } else {
        await createSalaryStructure(formData);
      }
      setShowCreateDialog(false);
      setEditingStructure(null);
      resetForm();
      loadStructures();
    } catch (error) {
      console.error('Failed to save salary structure:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this salary structure?')) {
      try {
        await deleteSalaryStructure(id);
        loadStructures();
      } catch (error) {
        console.error('Failed to delete salary structure:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      position: '',
      basicSalary: 0,
      allowances: [{ name: '', amount: 0, type: 'fixed' }],
      deductions: [{ name: '', amount: 0, type: 'fixed' }],
      status: 'active'
    });
  };

  const addAllowance = () => {
    setFormData({
      ...formData,
      allowances: [...formData.allowances, { name: '', amount: 0, type: 'fixed' }]
    });
  };

  const addDeduction = () => {
    setFormData({
      ...formData,
      deductions: [...formData.deductions, { name: '', amount: 0, type: 'fixed' }]
    });
  };

  const updateAllowance = (index: number, field: string, value: any) => {
    const updated = [...formData.allowances];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, allowances: updated });
  };

  const updateDeduction = (index: number, field: string, value: any) => {
    const updated = [...formData.deductions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, deductions: updated });
  };

  const openEditDialog = (structure: SalaryStructure) => {
    setEditingStructure(structure);
    setFormData({
      title: structure.title,
      department: structure.department,
      position: structure.position,
      basicSalary: structure.basicSalary,
      allowances: structure.allowances.length ? structure.allowances : [{ name: '', amount: 0, type: 'fixed' }],
      deductions: structure.deductions.length ? structure.deductions : [{ name: '', amount: 0, type: 'fixed' }],
      status: structure.status
    });
    setShowCreateDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Salary Structure</h1>
            <p className="text-gray-600">Manage salary templates and compensation packages</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
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
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-bold">Salary Structure</h1>
          <p className="text-gray-600">Manage salary templates and compensation packages</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            setEditingStructure(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStructure ? 'Edit' : 'Create'} Salary Structure</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Basic Salary</label>
                  <Input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({...formData, basicSalary: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Allowances</label>
                  <Button type="button" variant="outline" size="sm" onClick={addAllowance}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.allowances.map((allowance, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Allowance name"
                      value={allowance.name}
                      onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={allowance.amount}
                      onChange={(e) => updateAllowance(index, 'amount', Number(e.target.value))}
                    />
                    <select
                      className="px-3 py-2 border rounded-md"
                      value={allowance.type}
                      onChange={(e) => updateAllowance(index, 'type', e.target.value)}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Deductions</label>
                  <Button type="button" variant="outline" size="sm" onClick={addDeduction}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.deductions.map((deduction, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Deduction name"
                      value={deduction.name}
                      onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={deduction.amount}
                      onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))}
                    />
                    <select
                      className="px-3 py-2 border rounded-md"
                      value={deduction.type}
                      onChange={(e) => updateDeduction(index, 'type', e.target.value)}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingStructure ? 'Update' : 'Create'} Structure
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structures.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No salary structures found</h3>
            <p className="text-gray-500 mb-4">Create your first salary structure to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Structure
            </Button>
          </div>
        ) : (
          structures.map((structure) => (
          <Card key={structure._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{structure.title}</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm font-medium">{structure.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Position:</span>
                  <span className="text-sm font-medium">{structure.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Basic Salary:</span>
                  <span className="text-sm font-medium">${structure.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Salary:</span>
                  <span className="text-sm font-bold text-green-600">${structure.totalSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={structure.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {structure.status}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(structure)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(structure._id)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}