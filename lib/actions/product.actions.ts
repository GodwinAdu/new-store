"use server"

import { User, withAuth } from "../helpers/auth"
import History from "../models/history.models";
import Product from "../models/product.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";

interface ProductProps {
    name: string
    brandId: string
    categoryId: string
    barcode: string
    sku: string
    description: string
    tags: string[]
    color: string[]
    size: string[]
    unit: string[]
    isActive: boolean
}
async function _createProduct(user: User, values: ProductProps) {
    try {
        const { name, barcode, brandId, categoryId, sku, description, tags, color, unit, size, isActive } = values

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
export const fetchAllProducts = await withAuth(_fetchAllProducts)
export const deleteProduct = await withAuth(_deleteProduct)