"use server"

import { User, withAuth } from "../helpers/auth"
import History from "../models/history.models";
import Product from "../models/product.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";

interface ProductProps {
    name: string
    brandId?: string
    categoryId?: string
    barcode: string
    sku: string
    description?: string
    tags?: string[]
    color?: string[]
    size?: string[]
    unit: string[]
    defaultCost?: number
    defaultMargin?: number
    defaultSupplier?: string
    reorderPoint?: number
    reorderQuantity?: number
    isActive: boolean
}
async function _createProduct(user: User, values: ProductProps) {
    try {
        const { name, barcode, brandId, categoryId, sku, description, tags, color, unit, size, isActive, defaultCost, defaultMargin, defaultSupplier, reorderPoint, reorderQuantity } = values

        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) throw new Error("Product is already exist");

        const newProduct = new Product({
            name,
            brandId,
            barcode,
            categoryId,
            sku,
            description,
            tags,
            color,
            unit,
            size,
            isActive,
            defaultCost,
            defaultMargin,
            defaultSupplier,
            reorderPoint,
            reorderQuantity,
            createdBy: user._id
        });

        const history = new History({
            actionType: 'PRODUCT_CREATED',
            details: {
                categoryId: newProduct._id,
                createdBy: user?._id,
            },
            message: `${user.fullName} created new product with (ID: ${newProduct._id}) on ${new Date().toLocaleString()}.`,
            performedBy: user?._id,
            entityId: newProduct._id,
            entityType: 'PRODUCT'  // The type of the entity
        });


        await Promise.all([
            newProduct.save(),
            history.save()
        ]);

    } catch (error) {
        console.log("error happened while creating product", error);
        throw error;
    }
}

async function _fetchAllProducts(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const products = await Product.find({}).populate("createdBy");

        if (!products || products.length === 0) return [];

        return JSON.parse(JSON.stringify(products))
    } catch (error) {
        console.log("error happened while fetching products", error);
        throw error;
    }
}

async function _updateProduct(user: User, id: string, values: ProductProps) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const product = await Product.findById(id);
        if (!product) throw new Error("Product not found");

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: values.name,
                brandId: values.brandId,
                barcode: values.barcode,
                categoryId: values.categoryId,
                sku: values.sku,
                description: values.description,
                tags: values.tags,
                color: values.color,
                unit: values.unit,
                size: values.size,
                isActive: values.isActive,
                defaultCost: values.defaultCost,
                defaultMargin: values.defaultMargin,
                defaultSupplier: values.defaultSupplier,
                reorderPoint: values.reorderPoint,
                reorderQuantity: values.reorderQuantity,
                modifiedBy: user._id,
                mod_flag: true
            },
            { new: true }
        );

        const history = new History({
            actionType: 'PRODUCT_UPDATED',
            details: {
                productId: id,
                updatedBy: user._id,
            },
            message: `${user.fullName} updated product (ID: ${id}) on ${new Date().toLocaleString()}.`,
            performedBy: user._id,
            entityId: id,
            entityType: 'PRODUCT'
        });

        await history.save();

        return JSON.parse(JSON.stringify(updatedProduct));
    } catch (error) {
        console.log("error while updating product", error);
        throw error;
    }
}

async function _fetchProductById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const product = await Product.findById(id)
            .populate("brandId")
            .populate("categoryId")
            .populate("unit")
            .populate("defaultSupplier");

        if (!product) throw new Error("Product not found");

        return JSON.parse(JSON.stringify(product));
    } catch (error) {
        console.log("error while fetching product", error);
        throw error;
    }
}

async function _deleteProduct(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const product = await Product.findById(id)

        if (!product) {
            throw new Error("Product not found");
        }

        await deleteDocument({
            actionType: 'PRODUCT_DELETED',
            documentId: product._id,
            collectionName: 'Product',
            userId: `${user?._id}`,
            trashMessage: `"${product.name}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${product.name}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "product deleted successfully" };
    } catch (error) {
        console.log("error while deleting Product", error)
        throw error;
    }
}




export const createProduct = await withAuth(_createProduct);
export const fetchAllProducts = await withAuth(_fetchAllProducts);
export const updateProduct = await withAuth(_updateProduct);
export const fetchProductById = await withAuth(_fetchProductById);
export const deleteProduct = await withAuth(_deleteProduct);