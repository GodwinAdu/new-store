"use server"

import { type User, withAuth } from "../helpers/auth";
import { connectToDB } from "../mongoose";
import Transport from "../models/transport.models";
import { deleteDocument } from "./trash.actions";
import { revalidatePath } from "next/cache";

interface TransportProps {
    name: string
    type: string
    capacity: number
    location: string
    vehicleNumber: string
    driverName: string
    driverContact: string
    status: string
    isActive: boolean
}
async function _createTransport(user: User, values: TransportProps, path: string) {
    try {
        const { name, type, capacity, location, vehicleNumber, driverContact, driverName, status, isActive } = values
        if (!user) throw new Error("User not authenticated")

        await connectToDB();

        const existingVehicle = await Transport.findOne({ vehicleNumber });

        if (existingVehicle) throw new Error("Vehicle already created in database");

        const newVehicle = new Transport({
            name,
            type,
            capacity,
            location,
            vehicleNumber,
            driverContact,
            driverName,
            status,
            isActive,
            createdBy: user._id
        });

        await newVehicle.save()
        revalidatePath(path)

    } catch (error) {
        console.log("error happened while create transport", error);
        throw error
    }
};

async function _fetchAllTransports(user: User) {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB();

        const transports = await Transport.find({})
            .populate("createdBy")
        if (!transports || transports.length === 0) return [];

        return JSON.parse(JSON.stringify(transports))
    } catch (error) {
        console.log("error while fetching transports", error);
        throw error;
    }
}

async function _fetchTransportById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");
        const transport = await Transport.findById(id);
        if (!transport) return {};

        return JSON.parse(JSON.stringify(transport))

    } catch (error) {
        console.log("error happened while fetch transport by id", error);
        throw error
    }
}

async function _deleteTransport(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const transport = await Transport.findById(id)

        if (!transport) {
            throw new Error("Transport not found");
        }

        await deleteDocument({
            actionType: 'TRANSPORT_DELETED',
            documentId: transport._id,
            collectionName: 'Transport',
            userId: `${user?._id}`,
            trashMessage: `"${transport.name}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${transport.name}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Transport deleted successfully" };
    } catch (error) {
        console.log("error while deleting transport", error)
        throw error;
    }
}



export const createTransport = await withAuth(_createTransport)
export const fetchAllTransport = await withAuth(_fetchAllTransports)
export const fetchTransportById = await withAuth(_fetchTransportById)
export const deleteTransport = await withAuth(_deleteTransport)