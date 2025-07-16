"use server"

import { type User, withAuth } from "../helpers/auth";
import ProductBatch from "../models/product_batch.models";



async function _deductProductStock(
    user: User,
    warehouseId: string,
    items: any[]
) {
    if (!user) throw new Error("User not authenticated");

    for (const item of items) {
        const { product, quantity } = item;

        const stock = await ProductBatch.findOne({
            product,
            warehouse: warehouseId,
        });

        if (!stock) {
            throw new Error(`No stock record found for product ${product}`);
        }

        if (stock.quantity < quantity) {
            throw new Error(`Insufficient stock for product ${product}`);
        }

        stock.quantity -= quantity;
        stock.updatedAt = new Date();

        await stock.save();
    }
};

async function _updateProductStock(
    user: User,
    warehouseId: string,
    items: IPurchaseItem[]
) {
    if (!user) throw new Error("User not authenticated");

    for (const item of items) {
        const { product, quantity, unitPrice } = item;

        const existingStock = await ProductBatch.findOne({
            product,
            warehouse: warehouseId,
        });

        if (existingStock) {
            // Recalculate average cost price
            const totalExistingValue = existingStock.quantity * existingStock.averageCostPrice;
            const totalNewValue = quantity * unitPrice;
            const newQuantity = existingStock.quantity + quantity;
            const newAvgCost = (totalExistingValue + totalNewValue) / newQuantity;

            existingStock.quantity = newQuantity;
            existingStock.averageCostPrice = newAvgCost;
            existingStock.updatedAt = new Date();

            await existingStock.save();
        } else {
            // Create new stock record
            await ProductBatch.create({
                product,
                warehouse: warehouseId,
                quantity,
                averageCostPrice: unitPrice,
            });
        }
    }
};


export const updateProductStock = await withAuth(_updateProductStock);
export const deductProductStock = await withAuth(_deductProductStock);
