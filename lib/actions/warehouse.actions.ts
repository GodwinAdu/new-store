"use server"

import { withAuth, type User } from "../helpers/auth";
import History from "../models/history.models";
import Warehouse from "../models/warehouse.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";

interface WarehouseProps {
    name: string
    location: string
    description: string | undefined
    capacity: number
    managerId: string
    type: "main" | "secondary" | "cold" | "frozen" | "distribution";
    isActive: boolean
}

async function _createWarehouse(user: User, values: WarehouseProps) {
    try {
        const { name, location, description, capacity, type, isActive, managerId } = values;

        if (!user) throw new Error("User not authenticated");

        await connectToDB();

        const existingWarehouse = await Warehouse.findOne({ name });

        if (existingWarehouse) throw new Error("Warehouse already exist");

        const newWarehouse = new Warehouse({
            name,
            location,
            description,
            capacity,
            managerId,
            type,
            isActive,
            createdBy: user._id
        });

        const history = new History({
            actionType: 'WAREHOUSE_CREATED',
            details: {
                warehouseId: newWarehouse._id,
                createdBy: user?._id,
            },
            message: `${user.fullName} created new warehouse with (ID: ${newWarehouse._id}) on ${new Date().toLocaleString()}.`,
            performedBy: user?._id,
            entityId: newWarehouse._id,
            entityType: 'WAREHOUSE'  // The type of the entity
        });


        await Promise.all([
            newWarehouse.save(),
            history.save()
        ])

    } catch (error) {
        console.log("error happened while creating warehouse", error);
        throw error;
    }
}

async function _fetchAllWarehouses(user: User) {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB();
        const warehouses = await Warehouse.find({}).populate("createdBy")

        if (!warehouses || warehouses.length === 0) return [];

        return JSON.parse(JSON.stringify(warehouses))

    } catch (error) {
        console.log("error happened while fetching warehouses", error);
        throw error;
    }
}

async function _deleteWarehouse(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const warehouse = await Warehouse.findById(id)

        if (!warehouse) {
            throw new Error("Warehouse not found");
        }

        await deleteDocument({
            actionType: 'WAREHOUSE_DELETED',
            documentId: warehouse._id,
            collectionName: 'Warehouse',
            userId: `${user?._id}`,
            trashMessage: `"${warehouse.name}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${warehouse.name}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Warehouse deleted successfully" };
    } catch (error) {
        console.log("error while deleting brand", error)
        throw error;
    }
}



export const createWarehouse = await withAuth(_createWarehouse);
export const fetchAllWarehouses = await withAuth(_fetchAllWarehouses);
export const deleteWarehouse = await withAuth(_deleteWarehouse)