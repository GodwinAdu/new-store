'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useDebounce } from 'use-debounce'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {  Search, X } from 'lucide-react'
import { CustomerSearchResults } from './CustomerSearchResult'
import { Customer, searchCustomers } from '@/lib/actions/search-customer'
import { CustomerDialog } from './CustomerDialog'

export function CustomerSearch() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true)
            searchCustomers(debouncedSearchTerm).then((results) => {
                setCustomers(results)
                setIsSearching(false)
                setSelectedIndex(-1)
            })
        } else {
            setCustomers([])
        }
    }, [debouncedSearchTerm])

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer)
        setSearchTerm('')
        setCustomers([])
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => Math.min(prev + 1, customers.length - 1))
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => Math.max(prev - 1, -1))
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            handleSelectCustomer(customers[selectedIndex])
        }
    }

    const clearSelection = () => {
        setSelectedCustomer(null)
        setSearchTerm('')
        inputRef.current?.focus()
    }

    return (
        <Card>

            <div className="flex justify-between items-center p-4">
                <h2>Customer Search</h2>
                <CustomerDialog />
            </div>

            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-8"
                    />
                </div>
                {isSearching && <p className="text-sm text-muted-foreground flex justify-center items-center">Searching...</p>}
                {!isSearching && customers.length === 0 && !selectedCustomer && <p className="text-sm text-muted-foreground flex justify-center items-center">No Results</p>}
                {!isSearching && customers.length > 0 && (
                    <CustomerSearchResults
                        customers={customers}
                        selectedIndex={selectedIndex}
                        onSelect={handleSelectCustomer}
                    />
                )}
                {selectedCustomer && (
                    <div className="bg-muted p-4 rounded-md relative">
                        <button
                            onClick={clearSelection}
                            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <h3 className="font-medium mb-2">Selected Customer</h3>
                        <p className="text-sm"><strong>Name:</strong> {selectedCustomer.name}</p>
                        <p className="text-sm"><strong>Email:</strong> {selectedCustomer.email}</p>
                        <p className="text-sm"><strong>Company:</strong> {selectedCustomer.company}</p>
                        <Badge className="mt-2">ID: {selectedCustomer.id}</Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

