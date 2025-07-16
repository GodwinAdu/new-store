
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from "uuid";
import { playSuccessSound, playWarningSound } from '@/lib/audio';
import { toast } from './use-toast';

interface CartItem {
    id: string;
    name: string;
    unit?: string;
    item: Product;
    quantity: number;
}

interface Branch {
    _id: string;
    inventorySettings: {
        pricingType: 'manual' | 'automated';
        pricingGroups: {
            wholesale: boolean;
            retail: boolean;
        };
    }
}

interface Product {
    _id: string;
    name: string;
    stock: number;
    images?: string[];
    unit: {
        _id: string;
        name: string;
    }[];
    manualPrice: {
        unitId: {
            _id: string;
            name: string;
        };
        price: number;
    }[];
    wholesalePrice?: {
        wholesaleSellingPrice: number;
        wholesaleMarkupPercentage: number;
    };
    retailPrice?: {
        retailSellingPrice: number;
        retailMarkupPercentage: number;
    };
}

interface CartState {
    cartItems: CartItem[];
    addToCart: (branch: Branch, product: Product, selectedUnit: string, quantity?: number,) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateUnit: (productId: string, newUnit: string) => void;
    clearCart: () => void;
}

export const useCartStockAdjustmentStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            addToCart: (branch, product, selectedUnit, quantity = 1) => {
                // Determine pricing based on branch settings
                if (branch.inventorySettings.pricingType === 'manual') {
                    if (product.manualPrice[0].price === 0) {
                        playWarningSound();
                        toast({
                            title: 'Warning',
                            description: 'Product has no prices defined for selected unit. please check your branch settings',
                            variant: 'warning',
                        })
                        return;
                    }
                    const currentItems = get().cartItems
                    const existingItem = currentItems.find((currenItem) => currenItem.item._id === product._id && currenItem.unit === selectedUnit);

                    if (existingItem) {
                        const existingUnits = currentItems
                            .filter(cartItem => cartItem.item._id === product._id)
                            .map(cartItem => cartItem.unit);

                        let unitToAdd = product.manualPrice[0].unitId._id;

                        for (let i = 0; i < product.manualPrice.length; i++) {
                            if (!existingUnits.includes(product.manualPrice[i].unitId._id)) {
                                unitToAdd = product.manualPrice[i].unitId._id;
                                break;
                            }
                        }
                        if (existingUnits.length >= product.manualPrice.length) {
                            const primaryUnitIndex = currentItems.findIndex(cartItem => cartItem.item._id === product._id && cartItem.unit === product.manualPrice[0].unitId._id);

                            const newCartItems = currentItems.map((cartItem, index) =>
                                index === primaryUnitIndex
                                    ? { ...cartItem, quantity: cartItem.quantity + quantity }
                                    : cartItem
                            );
                            set({ cartItems: newCartItems });
                        } else {
                            const newCartItem = {
                                id: uuidv4(),
                                name: product.name,
                                item: product,
                                unit: unitToAdd,
                                quantity,
                            };
                            set({ cartItems: [...currentItems, newCartItem] });

                        }
                    } else {
                        const newCartItem = {
                            id: uuidv4(),
                            name: product.name,
                            item: product,
                            unit: selectedUnit || product.manualPrice[0].unitId._id,
                            quantity,
                        };
                        set({ cartItems: [...currentItems, newCartItem] });
                    }

                } else if (branch.inventorySettings.pricingType === 'automated') {
                    if (product.retailPrice?.retailMarkupPercentage === 0 || product.wholesalePrice?.wholesaleMarkupPercentage === 0) {
                        playWarningSound();
                        toast({
                            title: 'Warning',
                            description: 'Product has no prices defined for selected unit. please check your branch settings',
                            variant: 'warning',
                        })
                        return;
                    }
                    playSuccessSound()
                    const currentItems = get().cartItems;
                    console.log(currentItems, 'currentiq')
                    const existingItem = currentItems.find((currenItem) => currenItem.item._id === product._id && currenItem.unit === selectedUnit);

                    if (existingItem) {

                        const existingUnits = currentItems
                            .filter(cartItem => cartItem.item._id === product._id)
                            .map(cartItem => cartItem.unit);

                        let unitToAdd = product.unit[0]._id;
                        for (let i = 0; i < product.unit.length; i++) {
                            if (!existingUnits.includes(product.unit[i]._id)) {
                                unitToAdd = product.unit[i]._id;
                                break;
                            }
                        }
                        if (existingUnits.length >= product.unit.length) {
                            const primaryUnitIndex = currentItems.findIndex(cartItem => cartItem.item._id === product._id && cartItem.unit === product.unit[0]._id);

                            const newCartItems = currentItems.map((cartItem, index) =>
                                index === primaryUnitIndex
                                    ? { ...cartItem, quantity: cartItem.quantity + quantity }
                                    : cartItem
                            );
                            set({ cartItems: newCartItems });
                        } else {
                            const newCartItem = {
                                id: uuidv4(),
                                name: product.name,
                                item: product,
                                unit: unitToAdd,
                                quantity,
                            };
                            set({ cartItems: [...currentItems, newCartItem] });

                        }

                    } else {
                        const newCartItem = {
                            id: uuidv4(),
                            name: product.name,
                            item: product,
                            unit: selectedUnit || product.unit[0]._id,
                            quantity,
                        };
                        set({ cartItems: [...get().cartItems, newCartItem] });
                    }
                }
            },
            updateUnit: (itemId: string, newUnit: string) => {

                const newCartItems = get().cartItems.map((cartItem) =>
                    cartItem.id === itemId ? { ...cartItem, unit: newUnit } : cartItem
                );
                set({ cartItems: newCartItems });
            },
            removeFromCart: (productId) =>
                set((state) => ({
                    cartItems: state.cartItems.filter((item) => item.id !== productId),
                })),
            updateQuantity: (productId, quantity) =>
                set((state) => ({
                    cartItems: state.cartItems.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                })),
            clearCart: () => set({ cartItems: [] }),
        }),
        { name: 'stock-adjustment-storage', storage: createJSONStorage(() => localStorage), } // Key for localStorage
    )
);
