import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Trash2 } from "lucide-react"
import { useSelectSellingGroup } from "@/hooks/use-select-selling-group"
import { quickSearchProduct } from "@/lib/actions/product.actions"
import { toast } from "@/hooks/use-toast"
import debounce from "lodash/debounce"
import { findAutomatedPrice, findManualPrice, } from "@/lib/utils"
import { IBranch } from "@/lib/models/branch.models"
import UnitSelect from "./UnitSelect"
import { useCartStockTransferStore } from "@/hooks/use-cart-stock-transfer"



interface ProductSearchAndTableProps {
    branch: IBranch
}
type Price = {
    unitId: {
        _id: string;
        name: string;
    };
    price: number;
    tax: number;
}[]

export function ProductSearch({ branch }: ProductSearchAndTableProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { addToCart, cartItems, removeFromCart, updateQuantity, updateUnit } = useCartStockTransferStore();
    const { selectedValue } = useSelectSellingGroup()

    const debouncedFetchProduct = useCallback(
        debounce(async (query: string) => {
            if (query.trim().length >= 2) {
                setIsLoading(true)
                try {
                    const product = await quickSearchProduct(query.trim())
                    console.log(product, "product")
                    if (product) {
                        addToCart(branch, product, product.unit ? product.unit[0]._id : "", 1)
                        setSearchQuery("")
                    } else {
                        toast({
                            title: "No products found",
                            description: "Try a different search query.",
                        })
                        setSearchQuery('')
                    }
                } catch (error) {
                    console.log(error, "new error")
                    toast({
                        title: "Something went wrong",
                        description: "Product not found. Please try again.",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoading(false)
                }
            }
        }, 400),
        [addToCart, branch],
    )

    useEffect(() => {
        debouncedFetchProduct(searchQuery)
        return () => {
            debouncedFetchProduct.cancel()
        }
    }, [searchQuery, debouncedFetchProduct])

    return (
        <>
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    id="search"
                    placeholder="Search products..."
                    className="pl-8 max-w-lg mt-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cartItems.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No products added
                            </TableCell>
                        </TableRow>
                    ) : (
                        cartItems.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.item.name}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={product.quantity || 0}
                                        onChange={(e) => {
                                            const newQuantity = Number.parseInt(e.target.value)
                                            updateQuantity(product.id, (newQuantity))
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <UnitSelect
                                        selectedUnit={product.unit || product.item.unit[0]._id}
                                        onUnitChange={(value) => updateUnit(product.id, value)}
                                        units={product.item.unit as IUnit[]}
                                    />
                                </TableCell>
                                <TableCell>
                                    {branch?.inventorySettings?.pricingType === "manual"
                                        ? findManualPrice(product.item.manualPrice as Price, product?.unit as string)?.toFixed(2)
                                        : findAutomatedPrice(
                                            {
                                                ...product?.item,
                                                retailPrice: {
                                                    retailUnitCost: product?.item?.retailPrice?.retailSellingPrice || 0,
                                                    retailMarkupPercentage: product?.item?.retailPrice?.retailMarkupPercentage || 0,
                                                },
                                                wholesalePrice: {
                                                    wholesaleUnitCost: product?.item?.wholesalePrice?.wholesaleSellingPrice || 0,
                                                    wholesaleMarkupPercentage: product?.item?.wholesalePrice?.wholesaleMarkupPercentage || 0,
                                                },
                                            },
                                            (product?.item?.unit || []) as unknown as { _id: string; quantity: number; }[],
                                            product?.unit as string,
                                            selectedValue as string,
                                        )?.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {findManualPrice(
                                        product.item.manualPrice as Price,
                                        product.unit as string,
                                    ) * product.quantity}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </>
    )
}

