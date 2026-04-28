"use server"

import { type User, withAuth } from "../helpers/auth";
import History from "../models/history.models";
import Unit from "../models/unit.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";





async function _createUnit(user: User, values: { 
    name: string, 
    shortName?: string,
    isActive: boolean, 
    unitType: "base" | "derived",
    baseUnit?: string,
    conversionFactor?: number 
}) {
    try {
        const { name, shortName, isActive, unitType, baseUnit, conversionFactor } = values
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const existingUnit = await Unit.findOne({ name })

        if (existingUnit) throw new Error("Unit already exist");

        // Validate derived unit requirements
        if (unitType === "derived" && (!baseUnit || !conversionFactor)) {
            throw new Error("Derived units must have a base unit and conversion factor");
        }

        const newUnit = new Unit({
            name,
            shortName,
            isActive,
            unitType,
            baseUnit: unitType === "derived" ? baseUnit : undefined,
            conversionFactor: conversionFactor || 1,
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

        const units = await Unit.find({}).populate("createdBy").populate("baseUnit")

        if (!units || units.length === 0) return [];

        return JSON.parse(JSON.stringify(units))
    } catch (error) {
        console.log("error while fetch all units", error);
        throw error;
    }
}


async function _updateUnit(user: User, id: string, values: { 
    name: string, 
    shortName?: string,
    isActive: boolean, 
    unitType: "base" | "derived",
    baseUnit?: string,
    conversionFactor?: number 
}) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const unit = await Unit.findById(id)
        if (!unit) throw new Error("Unit not found")

        // Validate derived unit requirements
        if (values.unitType === "derived" && (!values.baseUnit || !values.conversionFactor)) {
            throw new Error("Derived units must have a base unit and conversion factor");
        }

        const updatedUnit = await Unit.findByIdAndUpdate(
            id,
            {
                name: values.name,
                shortName: values.shortName,
                isActive: values.isActive,
                unitType: values.unitType,
                baseUnit: values.unitType === "derived" ? values.baseUnit : undefined,
                conversionFactor: values.conversionFactor || 1,
            },
            { new: true }
        )

        const history = new History({
            actionType: 'UNIT_UPDATED',
            details: {
                unitId: id,
                updatedBy: user._id,
            },
            message: `${user.fullName} updated unit (ID: ${id}) on ${new Date().toLocaleString()}.`,
            performedBy: user._id,
            entityId: id,
            entityType: 'UNIT'
        });

        await history.save()

        return JSON.parse(JSON.stringify(updatedUnit))
    } catch (error) {
        console.log("error while updating unit", error);
        throw error
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




async function _fetchBaseUnits(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        let baseUnits = await Unit.find({ unitType: "base", isActive: true })

        // If no base units exist, create default ones
        if (baseUnits.length === 0) {
            const defaultBaseUnits = [
                { name: "Piece", shortName: "pcs", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
                { name: "Liter", shortName: "L", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
                { name: "Kilogram", shortName: "kg", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
                { name: "Meter", shortName: "m", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
                { name: "Pack", shortName: "pack", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id }
            ]

            await Unit.insertMany(defaultBaseUnits)
            baseUnits = await Unit.find({ unitType: "base", isActive: true })
        }

        return JSON.parse(JSON.stringify(baseUnits))
    } catch (error) {
        console.log("error while fetch base units", error);
        throw error;
    }
}

async function _seedBaseUnits(user: User) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const existingBaseUnits = await Unit.find({ unitType: "base" })
        
        if (existingBaseUnits.length > 0) {
            return { message: "Base units already exist" }
        }

        const defaultBaseUnits = [
            { name: "Piece", shortName: "pcs", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
            { name: "Liter", shortName: "L", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
            { name: "Kilogram", shortName: "kg", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
            { name: "Meter", shortName: "m", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
            { name: "Pack", shortName: "pack", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
            { name: "Bottle", shortName: "btl", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id },
            { name: "Can", shortName: "can", unitType: "base", conversionFactor: 1, isActive: true, createdBy: user._id }
        ]

        await Unit.insertMany(defaultBaseUnits)
        
        return { message: "Base units created successfully", count: defaultBaseUnits.length }
    } catch (error) {
        console.log("error while seeding base units", error);
        throw error;
    }
}

async function _fetchUnitById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized")

        await connectToDB()

        const unit = await Unit.findById(id).populate("baseUnit")

        if (!unit) throw new Error("Unit not found")

        return JSON.parse(JSON.stringify(unit))
    } catch (error) {
        console.log("error while fetching unit", error);
        throw error;
    }
}

export const createUnit = await withAuth(_createUnit)
export const fetchAllUnits = await withAuth(_fetchAllUnits)
export const fetchBaseUnits = await withAuth(_fetchBaseUnits)
export const seedBaseUnits = await withAuth(_seedBaseUnits)
export const updateUnit = await withAuth(_updateUnit)
export const fetchUnitById = await withAuth(_fetchUnitById)
export const deleteUnit = await withAuth(_deleteUnit)