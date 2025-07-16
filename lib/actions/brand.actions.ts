"use server"

import { type User, withAuth } from "../helpers/auth";
import Brand from "../models/brand.models";
import History from "../models/history.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";




async function _createBrand(user: User, values: { name: string, isActive: boolean }) {
    try {
        const { name, isActive } = values
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const existingBrand = await Brand.findOne({ name })

        if (existingBrand) throw new Error("Brand already exist");

        const newBrand = new Brand({
            name,
            isActive,
            createdBy: user._id,
        });

        const history = new History({
            actionType: 'BRAND_CREATED',
            details: {
                brandId: newBrand._id,
                createdBy: user?._id,
            },
            message: `${user.fullName} created new Brand with (ID: ${newBrand._id}) on ${new Date().toLocaleString()}.`,
            performedBy: user?._id,
            entityId: newBrand._id,
            entityType: 'BRAND'  // The type of the entity
        });


        await Promise.all([
            newBrand.save(),
            history.save()
        ])

    } catch (error) {
        console.log("error happened while create brand", error);
        throw error
    }
};


async function _fetchAllBrands(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const brands = await Brand.find({}).populate("createdBy")

        if (!brands || brands.length === 0) return [];


        return JSON.parse(JSON.stringify(brands))
    } catch (error) {
        console.log("error while fetch all brands", error);
        throw error;
    }
}


async function _deleteBrand(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const brand = await Brand.findById(id)

        if (!brand) {
            throw new Error("Brand not found");
        }

        await deleteDocument({
            actionType: 'BRAND_DELETED',
            documentId: brand._id,
            collectionName: 'Brand',
            userId: `${user?._id}`,
            trashMessage: `"${brand.name}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${brand.name}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Brand deleted successfully" };
    } catch (error) {
        console.log("error while deleting brand", error)
        throw error;
    }
}




export const createBrand = await withAuth(_createBrand)
export const fetchAllBrands = await withAuth(_fetchAllBrands)
export const deleteBrand = await withAuth(_deleteBrand)