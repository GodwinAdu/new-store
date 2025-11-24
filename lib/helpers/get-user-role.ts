"use server"
import Role from "../models/role.models";
import { connectToDB } from "../mongoose";
import { currentUser } from "./session";

export async function currentUserRole() {
    try {
        const user = await currentUser();
        console.log(user.role, "user log")

        if (!user) {
            throw new Error('User not found');
        }
        
        await connectToDB();
        const userRole = await Role.findOne({ displayName: user.role });

        if (!userRole) {
            console.log("cant find User role");
            return;
        }

        return JSON.parse(JSON.stringify(userRole));

    } catch (error) {
        console.log("Error happen while fetching role", error)
    }
}