
import { ScrollArea } from "@/components/ui/scroll-area"
import { Customer } from "@/lib/actions/search-customer"
import { User, Briefcase, Mail } from 'lucide-react'

interface CustomerSearchResultsProps {
    customers: Customer[]
    selectedIndex: number
    onSelect: (customer: Customer) => void
}

export function CustomerSearchResults({ customers, selectedIndex, onSelect }: CustomerSearchResultsProps) {
    return (
        <ScrollArea className="h-[300px] w-full rounded-md border">
            {customers.map((customer, index) => (
                <div
                    key={customer.id}
                    className={`flex items-center space-x-4 p-4 cursor-pointer ${index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                    onClick={() => onSelect(customer)}
                >
                    <div className="flex-shrink-0">
                        <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground truncate flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {customer.email}
                        </p>
                        <p className="text-sm text-muted-foreground truncate flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {customer.company}
                        </p>
                    </div>
                </div>
            ))}
        </ScrollArea>
    )
}

