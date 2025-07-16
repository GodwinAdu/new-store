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

export const createDepartment = await withAuth(_createDepartment)
export const fetchAllDepartments = await withAuth(_fetchAllDepartments)