"use server"

import { Types } from "mongoose";
import { type User, withAuth } from "../helpers/auth";
import ProductBatch from "../models/product_batch.models";
import { connectToDB } from "../mongoose";
import Product from "../models/product.models";
import Warehouse from "../models/warehouse.models";

interface InventoryItemInput {
    product: string;
    warehouse: string;
    unitCost: number;
    quantity: number;
    expiryDate?: Date | string;
    additionalExpenses?: number;
    sellingPrice: number;
    notes?: string;
}
async function _createProductStock(user: User, values: InventoryItemInput[]) {
    try {
        if (!user) throw new Error("User not authenticated");
        if (!values.length) return [];
        await connectToDB();

        for (const item of values) {
            // Create and save ProductBatch (will trigger pre-save hook)
            const productBatch = new ProductBatch({
                product: new Types.ObjectId(item.product),
                warehouseId: new Types.ObjectId(item.warehouse),
                unitCost: item.unitCost,
                sellingPrice: item.sellingPrice,
                quantity: item.quantity,
                remaining: item.quantity,
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                status: "In stock",
                createdBy: user._id
            });

            await productBatch.save(); // ⚠️ triggers batchNumber generation

        }

    } catch (error) {
        console.log("error happened while creating product stock", error);
        throw error
    }
};


async function _fetchAllStocks(user: User) {
    try {
        if (!user) throw new Error("User not authenticated");
        await connectToDB();

        const data = await ProductBatch.find({})
            .populate([{ path: 'product', model: Product }, { path: "warehouseId", model: Warehouse }])
            .exec()

        if (!data || data.length === 0) return [];

        return JSON.parse(JSON.stringify(data))
    } catch (error) {
        console.log("error happened while creating product stock", error);
        throw error
    }
}

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
            const totalExistingValue = existingStock.quantity * existingStock.sellingPricePrice;
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

export const createProductStock = await withAuth(_createProductStock);
export const fetchAllStocks = await withAuth(_fetchAllStocks);
export const updateProductStock = await withAuth(_updateProductStock);
export const deductProductStock = await withAuth(_deductProductStock);
