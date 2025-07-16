"use client";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSelectSellingGroup } from "@/hooks/use-select-selling-group";

export function SellingGroup({ branch }: { branch: IBranch }) {
    const { selectedValue, setSelectedValue } = useSelectSellingGroup();

    // Determine default value based on pricingGroups
    const { retail, wholesale } = branch.pricingGroups;

    // Set default if no value is already selected
    if (!selectedValue) {
        if (retail && wholesale) {
            setSelectedValue("retail");
        } else if (retail) {
            setSelectedValue("retail");
        } else if (wholesale) {
            setSelectedValue("wholesale");
        }
    }

    return (
        <div>
            <Select
                onValueChange={(value) => setSelectedValue(value as "retail" | "wholesale")}
                value={selectedValue || undefined} // Ensure a value is always set
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Options</SelectLabel>
                        {retail && <SelectItem value="retail">Retail Price</SelectItem>}
                        {wholesale && <SelectItem value="wholesale">Wholesale Price</SelectItem>}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
