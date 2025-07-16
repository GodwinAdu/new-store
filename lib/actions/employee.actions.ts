"use server"


import { login } from "../helpers/session";
import { compare, hash } from 'bcryptjs'
import Staff from "../models/staff.models";
import { connectToDB } from "../mongoose";
import { User, withAuth } from "../helpers/auth";
import Department from "../models/deparment.models";
import History from "../models/history.models";
import { deleteDocument } from "./trash.actions";




interface LoginProps {
    email: string;
    password: string;
    rememberMe: boolean
}


async function _createStaff(user: User, values: any) {
    try {
        if (!user) throw new Error("User not authenticated")

        const { password, username, departmentId } = values;
        await connectToDB();
        const [existingUserByUsername, existingUserByEmail, existingUserByPhone, department] = await Promise.all([
            Staff.findOne({ username }),
            Staff.findOne({ email: values.email }),
            Staff.findOne({ phone: values.phone }),
            Department.findById(departmentId)
        ])
        if (existingUserByUsername || existingUserByEmail || existingUserByPhone) {
            throw new Error("Staff already exist in database or department not found")
        }

        const hashedPassword = await hash(password, 10)

        const newUser = new Staff({
            ...values,
            password: hashedPassword,
            action_type: "created"
        });


        const history = new History({
            actionType: 'STAFF_CREATED',
            details: {
                itemId: newUser._id,
                deletedAt: new Date(),
            },
            message: `User ${user.fullName} created Staff named "${newUser.fullName}" (ID: ${newUser._id}) on ${new Date()}.`,
            performedBy: user._id, // User who performed the action,
            entityId: newUser._id,  // The ID of the deleted unit
            entityType: 'STAFF',  // The type of the entity
        });
        department.members.push(newUser._id)

        await Promise.all([
            newUser.save(),
            department.save(),
            history.save()
        ])

    } catch (error) {
        console.log("something went wrong", error);
        throw error;
    }
}




export async function fetchStaffById(id: string) {
    try {
        await connectToDB();
        const user = await Staff.findById(id)

        if (!user) return null

        return JSON.parse(JSON.stringify(user))

    } catch (error) {
        console.log("error while fetching staff by id", error);
        throw error;
    }
}


export async function loginStaff(values: LoginProps) {
    try {
        const { email, password, rememberMe } = values;

        await connectToDB();

        const user = await Staff.findOne({ email })


        if (!user) throw new Error(`user not found`);

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        const userId = user._id.toString();
        const role = user.role

        await login(userId, role, rememberMe)

        return JSON.parse(JSON.stringify(user));



    } catch (error) {
        console.log("error while login user", error);
        throw error;
    }
}


async function _fetchAllStaffs(user: User) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB();

        const staffs = await Staff.find({})
        if (staffs.length === 0) return [];

        return JSON.parse(JSON.stringify(staffs))
    } catch (error) {
        console.log("Something went wrong", error);
        throw error
    }
}

async function _deleteStaff(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const staff = await Staff.findById(id)

        if (!staff) {
            throw new Error("Staff not found");
        }

        await deleteDocument({
            actionType: 'STAFF_DELETED',
            documentId: staff._id,
            collectionName: 'Staff',
            userId: `${user?._id}`,
            trashMessage: `"${staff.fullName}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${staff.fullName}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Staff deleted successfully" };
    } catch (error) {
        console.log("error while deleting staff", error)
        throw error;
    }
}



export const createStaff = await withAuth(_createStaff)
export const deleteStaff = await withAuth(_deleteStaff)
export const fetchAllStaffs = await withAuth(_fetchAllStaffs)