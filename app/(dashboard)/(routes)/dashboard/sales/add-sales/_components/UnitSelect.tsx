import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UnitSelectionProps {
    units: IUnit[];
    selectedUnit: string; // Add this prop
    onUnitChange: (value: string) => void; // Rename the prop for better clarity
}

const UnitSelect = ({ selectedUnit, units, onUnitChange }: UnitSelectionProps) => {
    return (
        <Select
            onValueChange={(value) => onUnitChange(value)}
            value={selectedUnit} // Use the selected unit prop

        >
            <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
                {units?.map((unit) => (
                    <SelectItem key={unit._id} value={unit._id}>
                        {unit.name}{`(${unit.quantity})`}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default UnitSelect;
