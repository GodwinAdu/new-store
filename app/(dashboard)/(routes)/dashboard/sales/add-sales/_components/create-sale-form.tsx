"use client"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { SellingGroup } from "./selling-group"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CustomerSearch } from "./CustomerSearch"
import type { IBranch } from "@/lib/models/branch.models"
import { useCartSaleStore } from "@/hooks/use-cart-sale"
import { useSelectSellingGroup } from "@/hooks/use-select-selling-group"
import { ProductSearchAndTable } from "./ProductSearchAndTable"
import { useSaleForm } from "@/hooks/form/use-sale-form"
import { calculateCostPrice, calculateQuantity, findAutomatedPrice, findManualPrice } from "@/lib/utils"
import { SaleFormValues } from "@/lib/validators/sale-form-schema"
import { PaymentTermsField } from "./PaymentTerm"
import { SaleDateField } from "./SaleDate"
import { InvoiceNoField } from "./Invoice"
import { DiscountField } from "./Discount"
import { TaxField } from "./TaxField"
import { SellNoteField } from "./SellNote"
import { ShippingDetailsFields } from "./ShippingDetails"
import { PaymentDetailsFields } from "./PaymentField"
import { playErrorSound, playSuccessSound } from "@/lib/audio"
import { toast } from "@/hooks/use-toast"
import { createSale } from "@/lib/actions/sale.actions"
import { useParams, usePathname, useRouter } from "next/navigation"
import { paymentMethods } from '../../../../../../../../../lib/settings/store.settings';


type Props = {
    branch: IBranch
    accounts: IAccount[];
    currency: string;
    paymentMethods: {
        name: string
    }[];
}
type Price = {
    unitId: {
        _id: string;
        name: string;
    };
    price: number;
    tax: number;
}[]
const CreateSaleForm = ({ branch, accounts, currency, paymentMethods }: Props) => {
    const form = useSaleForm()
    const { cartItems, clearCart } = useCartSaleStore()
    const { selectedValue } = useSelectSellingGroup()
    const router = useRouter();
    const params = useParams();
    const path = usePathname();

    const { storeId, branchId } = params;

    const subtotal = cartItems.reduce((sum, item) => {
        const price =
            branch.inventorySettings.pricingType === "manual"
                ? findManualPrice(item.item?.manualPrice as Price, item?.unit as string)
                : findAutomatedPrice(
                    {
                        ...item?.item,
                        retailPrice: {
                            retailUnitCost: item?.item?.retailPrice?.retailSellingPrice || 0,
                            retailMarkupPercentage: item?.item?.retailPrice?.retailMarkupPercentage || 0,
                        },
                        wholesalePrice: {
                            wholesaleUnitCost: item?.item?.wholesalePrice?.wholesaleSellingPrice || 0,
                            wholesaleMarkupPercentage: item?.item?.wholesalePrice?.wholesaleMarkupPercentage || 0,
                        },
                    },
                    item?.item?.unit as unknown as { _id: string; quantity: number; }[],
                    item?.unit as string,
                    selectedValue as string,
                )
        return sum + (price ?? 0) * item.quantity
    }, 0);


    const costPrice = cartItems.reduce((sum, item) => {
        const price = calculateCostPrice(
            item.item.unit as unknown as { _id: string; quantity: number; }[],
            item.unit as string,
            item.item.vendorPrice.costPrice as number,
            item.quantity,
        );
        return sum + price
    }, 0);


    async function onSubmit(values: SaleFormValues) {
        try {
            const proceedValues = {
                ...values,
                products: cartItems.map((item: any) => ({
                    ...item,
                    productId: item.item._id,
                    totalQuantity: calculateQuantity(
                        item.unit,
                        item.quantity,
                        item.item.unit,
                    ),
                    subTotal: findManualPrice(
                        item.item.manualPrice as Price,
                        item.unit as string,
                    ) * item.quantity,
                })),
                costPrice,
                totalAmount: subtotal,
            }

            await createSale(proceedValues, path);
            playSuccessSound();
            form.reset();
            clearCart();
            router.push(`/${storeId}/dashboard/${branchId}/sales/all-sales`)
            toast({
                title: 'Sale created successfully',
                description: 'Sale has been created successfully.',
                variant: 'success',
            })

        } catch {
            playErrorSound();
            toast({
                title: 'Something went wrong',
                description: 'Please try again later...',
                variant: 'destructive',
            })

        }
    }

    return (
        <>
            <div className="max-w-xs space-y-2">
                <label className="font-bold">Pricing Type</label>
                {branch.inventorySettings.pricingType === "manual" ? (
                    <Input className="w-[180px] bg-gray-200" value="Manual Price" disabled />
                ) : (
                    <SellingGroup branch={branch} />
                )}
            </div>
            <Separator className="my-2" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 py-3">
                            <CustomerSearch />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                                <PaymentTermsField control={form.control} />
                                <SaleDateField control={form.control} />
                                <InvoiceNoField control={form.control} />
                            </div>
                        </CardContent>
                    </Card>
                    <Separator />
                    <Card>
                        <CardContent className="space-y-4">
                            <ProductSearchAndTable currency={currency} branch={branch} />
                            <div className="flex justify-end">
                                <p className="text-lg font-semibold">Total Amount:  {currency} {subtotal.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DiscountField control={form.control} />
                            <TaxField control={form.control} />
                            <SellNoteField control={form.control} />
                        </CardContent>
                    </Card>
                    <ShippingDetailsFields control={form.control} />
                    <PaymentDetailsFields paymentMethods={paymentMethods} currency={currency} control={form.control} accounts={accounts} />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </>
    )
}

export default CreateSaleForm

