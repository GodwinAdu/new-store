"use server"

import { withAuth, type User } from "../helpers/auth";
import Department from "../models/deparment.models";
import { connectToDB } from "../mongoose";


async function _createDepartment(user: User, values: { name: string, description: string }) {
    try {
        if (!user) throw new Error("User not authenticated");

        const { name, description } = values;

        await connectToDB();


        const existingDepartment = await Department.findOne({ name })
        if (existingDepartment) throw new Error("Department already created");

        const newDepartment = new Department({
            name,
            description,
            createdBy: user._id
        });

        await newDepartment.save()
    } catch (error) {
        console.log("error happened in create department", error)
        throw error;
    }
}


async function _fetchAllDepartments(user: User) {
    try {
        if (!user) throw new Error("User not authenticated");
        await connectToDB();
        const department = await Department.find({}).populate("createdBy")

        console.log(department)

        if (department.length === 0) return []

        return JSON.parse(JSON.stringify(department))
    } catch (error) {
        console.log("error happened while fetch all departments", error);
        throw error;
    }
}

async function _updateDepartment(user: User, id: string, values: { name: string, description: string }) {
    try {
        if (!user) throw new Error("User not authenticated");
        await connectToDB();

        const department = await Department.findByIdAndUpdate(
            id,
            { ...values, modifiedBy: user._id, mod_flag: true },
            { new: true }
        );

        if (!department) throw new Error("Department not found");
        return JSON.parse(JSON.stringify(department));
    } catch (error) {
        console.log("error in update department", error);
        throw error;
    }
}

async function _deleteDepartment(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated");
        await connectToDB();

        const department = await Department.findByIdAndDelete(id);
        if (!department) throw new Error("Department not found");
    } catch (error) {
        console.log("error in delete department", error);
        throw error;
    }
}

export const createDepartment = await withAuth(_createDepartment)
export const fetchAllDepartments = await withAuth(_fetchAllDepartments)
export const updateDepartment = await withAuth(_updateDepartment)
export const deleteDepartment = await withAuth(_deleteDepartment)