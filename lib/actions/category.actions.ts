"use server"

import { type User, withAuth } from "../helpers/auth";
import Category from "../models/category.models";
import History from "../models/history.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";





async function _createCategory(user: User, values: { name: string, isActive: boolean }) {
    try {
        const { name, isActive } = values
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const existingCategory = await Category.findOne({ name })

        if (existingCategory) throw new Error("Category already exist");

        const newCategory = new Category({
            name,
            isActive,
            createdBy: user._id,
        });

        const history = new History({
            actionType: 'CATEGORY_CREATED',
            details: {
                categoryId: newCategory._id,
                createdBy: user?._id,
            },
            message: `${user.fullName} created new Category with (ID: ${newCategory._id}) on ${new Date().toLocaleString()}.`,
            performedBy: user?._id,
            entityId: newCategory._id,
            entityType: 'CATEGORY'  // The type of the entity
        });


        await Promise.all([
            newCategory.save(),
            history.save()
        ])

    } catch (error) {
        console.log("error happened while create Category", error);
        throw error
    }
};


async function _fetchAllCategories(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const categories = await Category.find({}).populate("createdBy")

        if (!categories || categories.length === 0) return [];


        return JSON.parse(JSON.stringify(categories))
    } catch (error) {
        console.log("error while fetch all categories", error);
        throw error;
    }
}

async function _updateCategory(user: User, id: string, values: { name: string, isActive: boolean }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const category = await Category.findById(id);
        if (!category) throw new Error("Category not found");

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name: values.name, isActive: values.isActive },
            { new: true }
        );

        const history = new History({
            actionType: 'CATEGORY_UPDATED',
            details: { categoryId: id, updatedBy: user._id },
            message: `${user.fullName} updated category (ID: ${id}) on ${new Date().toLocaleString()}.`,
            performedBy: user._id,
            entityId: id,
            entityType: 'CATEGORY'
        });

        await history.save();

        return JSON.parse(JSON.stringify(updatedCategory));
    } catch (error) {
        console.log("error while updating category", error);
        throw error;
    }
}

async function _fetchCategoryById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const category = await Category.findById(id);
        if (!category) throw new Error("Category not found");

        return JSON.parse(JSON.stringify(category));
    } catch (error) {
        console.log("error while fetching category", error);
        throw error;
    }
}

async function _deleteCategory(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const category = await Category.findById(id)

        if (!category) {
            throw new Error("Category not found");
        }

        await deleteDocument({
            actionType: 'CATEGORY_DELETED',
            documentId: category._id,
            collectionName: 'Category',
            userId: `${user?._id}`,
            trashMessage: `"${category.name}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${category.name}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Category deleted successfully" };
    } catch (error) {
        console.log("error while deleting Category", error)
        throw error;
    }
}



export const createCategory = await withAuth(_createCategory)
export const fetchAllCategories = await withAuth(_fetchAllCategories)
export const updateCategory = await withAuth(_updateCategory)
export const fetchCategoryById = await withAuth(_fetchCategoryById)
export const deleteCategory = await withAuth(_deleteCategory)