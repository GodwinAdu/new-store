'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { UserPlus, UserCheck, Search, X } from 'lucide-react'
import { createCustomer } from '@/lib/actions/customer.actions'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Customer {
  id: string
  _id?: string
  name: string
  email?: string
  phone?: string
  loyaltyPoints?: number
  totalSpent?: number
}

export interface CustomerSearchPopoverProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  onSelect: (customer: Customer | null) => void
  onCreateNew: () => void
}

// ---------------------------------------------------------------------------
// CustomerSearchPopover
// ---------------------------------------------------------------------------

export function CustomerSearchPopover({
  customers,
  selectedCustomer,
  onSelect,
  onCreateNew,
}: CustomerSearchPopoverProps) {
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // 300ms debounce on search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Filter customers: only after 2+ characters
  const filteredCustomers =
    debouncedSearch.length >= 2
      ? customers.filter((c) => {
          const q = debouncedSearch.toLowerCase()
          return (
            c.name.toLowerCase().includes(q) ||
            (c.phone ?? '').toLowerCase().includes(q) ||
            (c.email ?? '').toLowerCase().includes(q)
          )
        })
      : []

  function handleSelect(customer: Customer) {
    onSelect(customer)
    setOpen(false)
    setSearchInput('')
    setDebouncedSearch('')
  }

  function handleRemove() {
    onSelect(null)
  }

  async function handleCreateCustomer() {
    if (!newCustomerForm.name.trim()) return
    setIsCreating(true)
    try {
      await createCustomer({
        name: newCustomerForm.name.trim(),
        email: newCustomerForm.email.trim() || undefined,
        phone: newCustomerForm.phone.trim() || undefined,
      })
      toast.success('Customer created successfully')
      setCreateDialogOpen(false)
      setNewCustomerForm({ name: '', email: '', phone: '' })
      onCreateNew()
    } catch {
      toast.error('Failed to create customer')
    } finally {
      setIsCreating(false)
    }
  }

  // If a customer is selected, show their name as a button to remove them
  if (selectedCustomer) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm">
          <UserCheck className="h-4 w-4 text-primary" />
          <span className="font-medium">{selectedCustomer.name}</span>
          {selectedCustomer.loyaltyPoints != null && (
            <span className="text-muted-foreground text-xs ml-1">
              ({selectedCustomer.loyaltyPoints} pts)
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleRemove}
          aria-label="Remove customer"
          data-testid="remove-customer-btn"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            data-testid="add-customer-btn"
          >
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-3" align="start">
          {/* Search input */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, phone, or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 h-8 text-sm"
              autoFocus
              data-testid="customer-search-input"
            />
          </div>

          {/* Results */}
          {debouncedSearch.length < 2 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Type at least 2 characters to search
            </p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No customers found
            </p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-1" data-testid="customer-results">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id ?? customer._id}
                    type="button"
                    className="w-full text-left rounded-md px-2 py-2 hover:bg-muted/60 transition-colors"
                    onClick={() => handleSelect(customer)}
                    data-testid="customer-result-item"
                  >
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[customer.phone, customer.email].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* New Customer button */}
          <div className="mt-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => {
                setOpen(false)
                setCreateDialogOpen(true)
              }}
              data-testid="new-customer-btn"
            >
              <UserPlus className="h-3.5 w-3.5" />
              New Customer
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Customer Creation Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-name"
                placeholder="Customer name"
                value={newCustomerForm.name}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
                }
                data-testid="customer-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={newCustomerForm.email}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                }
                data-testid="customer-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="Phone number"
                value={newCustomerForm.phone}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                }
                data-testid="customer-phone-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setNewCustomerForm({ name: '', email: '', phone: '' })
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateCustomer}
              disabled={!newCustomerForm.name.trim() || isCreating}
              data-testid="create-customer-submit"
            >
              {isCreating ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
