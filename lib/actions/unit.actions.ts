"use server"

import { type User, withAuth } from "../helpers/auth";
import History from "../models/history.models";
import Unit from "../models/unit.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";





async function _createUnit(user: User, values: { name: string, isActive: boolean }) {
    try {
        const { name, isActive } = values
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const existingUnit = await Unit.findOne({ name })

        if (existingUnit) throw new Error("Unit already exist");

        const newUnit = new Unit({
            name,
            isActive,
            createdBy: user._id,
        });

        const history = new History({
            actionType: 'UNIT_CREATED',
            details: {
                unitId: newUnit._id,
                createdBy: user?._id,
            },
            message: `${user.fullName} created new unit with (ID: ${newUnit._id}) on ${new Date().toLocaleString()}.`,
            performedBy: user?._id,
            entityId: newUnit._id,
            entityType: 'UNIT'  // The type of the entity
        });


        await Promise.all([
            newUnit.save(),
            history.save()
        ])

    } catch (error) {
        console.log("error happened while create unit", error);
        throw error
    }
};


async function _fetchAllUnits(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const units = await Unit.find({}).populate("createdBy")

        if (!units || units.length === 0) return [];


        return JSON.parse(JSON.stringify(units))
    } catch (error) {
        console.log("error while fetch all units", error);
        throw error;
    }
}


async function _deleteUnit(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const unit = await Unit.findById(id)

        if (!unit) {
            throw new Error("Unit not found");
        }

        await deleteDocument({
            actionType: 'UNIT_DELETED',
            documentId: unit._id,
            collectionName: 'Unit',
            userId: `${user?._id}`,
            trashMessage: `"${unit.name}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${unit.name}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Unit deleted successfully" };
    } catch (error) {
        console.log("error while deleting Unit", error)
        throw error;
    }
}




export const createUnit = await withAuth(_createUnit)
export const fetchAllUnits = await withAuth(_fetchAllUnits)
export const deleteUnit = await withAuth(_deleteUnit)