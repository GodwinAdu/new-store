'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Plus, 
  Search, 
  Star, 
  Gift, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Crown,
  Heart,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { getCustomers, createCustomer, updateCustomer, updateCustomerPoints, deleteCustomer, getCustomerStats } from '@/lib/actions/customer.actions'

interface Customer {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  loyaltyPoints: number
  totalSpent: number
  totalOrders: number
  createdAt: string
  lastVisit: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  notes?: string
  birthday?: string
  preferences?: string[]
}

interface CustomerStats {
  totalCustomers: number
  loyaltyMembers: number
  avgSpent: number
  vipCustomers: number
}



export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({ totalCustomers: 0, loyaltyMembers: 0, avgSpent: 0, vipCustomers: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    notes: ''
  })

  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [])

  const loadCustomers = async () => {
    try {
      const customersData = await getCustomers()
      setCustomers(customersData)
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getCustomerStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="h-4 w-4" />
      case 'gold': return <Star className="h-4 w-4" />
      case 'silver': return <Gift className="h-4 w-4" />
      default: return <Heart className="h-4 w-4" />
    }
  }

  const handleCreateCustomer = async () => {
    try {
      await createCustomer(newCustomer)
      toast.success('Customer added successfully')
      setIsAddDialogOpen(false)
      setNewCustomer({ name: '', email: '', phone: '', address: '', birthday: '', notes: '' })
      loadCustomers()
      loadStats()
    } catch (error) {
      toast.error('Failed to add customer')
    }
  }

  const addLoyaltyPoints = async (customerId: string, points: number) => {
    try {
      await updateCustomerPoints(customerId, points)
      toast.success(`Added ${points} loyalty points`)
      loadCustomers()
    } catch (error) {
      toast.error('Failed to add points')
    }
  }

  const redeemPoints = async (customerId: string, points: number) => {
    const customer = customers.find(c => c._id === customerId)
    if (customer && customer.loyaltyPoints >= points) {
      try {
        await updateCustomerPoints(customerId, -points)
        toast.success(`Redeemed ${points} loyalty points`)
        loadCustomers()
      } catch (error) {
        toast.error('Failed to redeem points')
      }
    } else {
      toast.error('Insufficient loyalty points')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="text-xs text-muted-foreground">+12% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter(c => c.loyaltyPoints > 0).length}</div>
            <div className="text-xs text-muted-foreground">Active members</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Per customer</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.tier === 'gold' || c.tier === 'platinum').length}
            </div>
            <div className="text-xs text-muted-foreground">Gold & Platinum</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input 
                    id="customerName" 
                    placeholder="Enter customer name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input 
                    id="customerEmail" 
                    type="email" 
                    placeholder="customer@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input 
                    id="customerPhone" 
                    placeholder="+1234567890"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Textarea 
                    id="customerAddress" 
                    placeholder="Enter address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="customerBirthday">Birthday (Optional)</Label>
                  <Input 
                    id="customerBirthday" 
                    type="date"
                    value={newCustomer.birthday}
                    onChange={(e) => setNewCustomer({...newCustomer, birthday: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="customerNotes">Notes</Label>
                  <Textarea 
                    id="customerNotes" 
                    placeholder="Any special notes or preferences"
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCustomer} disabled={!newCustomer.name.trim()}>
                    Add Customer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer._id} 
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer?._id === customer._id ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{customer.name}</h3>
                          <Badge className={`text-xs ${getTierColor(customer.tier)}`}>
                            {getTierIcon(customer.tier)}
                            <span className="ml-1 capitalize">{customer.tier}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {customer.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm font-medium">
                        <Gift className="h-4 w-4 mr-1 text-purple-500" />
                        {customer.loyaltyPoints} pts
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${customer.totalSpent.toFixed(2)} spent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div>
          {selectedCustomer ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Avatar className="mr-3">
                      <AvatarFallback>{selectedCustomer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {selectedCustomer.name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-3">
                      {selectedCustomer.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{selectedCustomer.email}</span>
                        </div>
                      )}
                      {selectedCustomer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{selectedCustomer.phone}</span>
                        </div>
                      )}
                      {selectedCustomer.address && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                          <span className="text-sm">{selectedCustomer.address}</span>
                        </div>
                      )}
                      {selectedCustomer.birthday && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{selectedCustomer.birthday}</span>
                        </div>
                      )}
                    </div>
                    
                    {selectedCustomer.preferences && selectedCustomer.preferences.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Preferences</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomer.preferences.map(pref => (
                            <Badge key={pref} variant="secondary" className="text-xs">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedCustomer.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="loyalty" className="space-y-4">
                    <div className="text-center">
                      <Badge className={`text-lg px-4 py-2 ${getTierColor(selectedCustomer.tier)}`}>
                        {getTierIcon(selectedCustomer.tier)}
                        <span className="ml-2 capitalize">{selectedCustomer.tier} Member</span>
                      </Badge>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                        {selectedCustomer.loyaltyPoints}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Loyalty Points</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Spent:</span>
                        <span className="font-medium">${selectedCustomer.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Orders:</span>
                        <span className="font-medium">{selectedCustomer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Member Since:</span>
                        <span className="font-medium">{selectedCustomer.joinDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Visit:</span>
                        <span className="font-medium">{selectedCustomer.lastVisit}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Points
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Add Loyalty Points</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input 
                              type="number" 
                              placeholder="Enter points to add"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const points = parseInt((e.target as HTMLInputElement).value)
                                  if (points > 0) {
                                    addLoyaltyPoints(selectedCustomer._id, points)
                                  }
                                }
                              }}
                            />
                            <Button 
                              className="w-full"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                                const points = parseInt(input?.value || '0')
                                if (points > 0) {
                                  addLoyaltyPoints(selectedCustomer._id, points)
                                }
                              }}
                            >
                              Add Points
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Gift className="h-4 w-4 mr-1" />
                            Redeem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Redeem Points</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                              Available: {selectedCustomer.loyaltyPoints} points
                            </div>
                            <Input 
                              type="number" 
                              placeholder="Enter points to redeem"
                              max={selectedCustomer.loyaltyPoints}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const points = parseInt((e.target as HTMLInputElement).value)
                                  if (points > 0) {
                                    redeemPoints(selectedCustomer._id, points)
                                  }
                                }
                              }}
                            />
                            <Button 
                              className="w-full"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                                const points = parseInt(input?.value || '0')
                                if (points > 0) {
                                  redeemPoints(selectedCustomer._id, points)
                                }
                              }}
                            >
                              Redeem Points
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <div className="text-center text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Order history will appear here</p>
                      <p className="text-xs">Feature coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a customer to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}