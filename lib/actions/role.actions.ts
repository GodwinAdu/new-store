"use server"

import { revalidatePath } from "next/cache";
import Role from "../models/role.models";
import { connectToDB } from "../mongoose";

import { z } from "zod";
import History from "../models/history.models";
import { type User, withAuth } from "../helpers/auth";
import { currentUser } from "../helpers/session";
import { CreateRoleSchema } from '@/lib/validators/role.validator';


// const values = {
//     name: "Admin",
//     displayName: "admin",
//     description: "Manage the administration",
//     permissions: {
//         manageAccess: true,

//         manageOnlyPos: true,
//         dashboard: true,
//         user: true,
//         product: true,
//         sales: true,
//         purchase: true,
//         stockTransfer: true,
//         stockAdjustment: true,
//         expenses: true,
//         paymentAccount: true,
//         report: true,

//         addRole: true,
//         manageRole: true,
//         viewRole: true,
//         editRole: true,
//         deleteRole: true,

//         addUser: true,
//         manageUser: true,
//         viewUser: true,
//         editUser: true,
//         deleteUser: true,

//         listProduct: true,
//         addProduct: true,
//         manageProduct: true,
//         viewProduct: true,
//         editProduct: true,
//         deleteProduct: true,

//         addUnit: true,
//         manageUnit: true,
//         viewUnit: true,
//         editUnit: true,
//         deleteUnit: true,

//         addBrand: true,
//         manageBrand: true,
//         viewBrand: true,
//         editBrand: true,
//         deleteBrand: true,

//         addCategory: true,
//         manageCategory: true,
//         viewCategory: true,
//         editCategory: true,
//         deleteCategory: true,

//         addPrintLabel: true,
//         managePrintLabel: true,
//         viewPrintLabel: true,

//         addVariation: true,
//         manageVariation: true,
//         viewVariation: true,
//         editVariation: true,
//         deleteVariation: true,

//         manageImportProduct: true,
//         addSellingGroupPrice: true,
//         manageSellingGroupPrice: true,
//         viewSellingGroupPrice: true,
//         editSellingGroupPrice: true,
//         deleteSellingGroupPrice: true,

//         addWarrant: true,
//         manageWarrant: true,
//         viewWarrant: true,
//         editWarrant: true,
//         deleteWarrant: true,

//         manageAllSales: true,
//         addSales: true,
//         manageSales: true,
//         viewSales: true,
//         editSales: true,
//         deleteSales: true,

//         addOrder: true,
//         manageOrder: true,
//         viewOrder: true,
//         editOrder: true,
//         deleteOrder: true,
//         listOrder: true,

//         listSellReturn: true,

//         importSales: true,

//         listPurchase: true,
//         addPurchase: true,
//         managePurchase: true,
//         viewPurchase: true,
//         editPurchase: true,
//         deletePurchase: true,

//         listPurchaseReturn: true,

//         importPurchase: true,

//         listStockTransfer: true,
//         addStockTransfer: true,
//         manageStockTransfer: true,
//         viewStockTransfer: true,
//         editStockTransfer: true,
//         deleteStockTransfer: true,

//         listStockAdjustment: true,
//         addStockAdjustment: true,
//         manageStockAdjustment: true,
//         viewStockAdjustment: true,
//         editStockAdjustment: true,
//         deleteStockAdjustment: true,

//         addExpensesCategory: true,
//         manageExpensesCategory: true,
//         viewExpensesCategory: true,
//         editExpensesCategory: true,
//         deleteExpensesCategory: true,

//         addExpenses: true,
//         manageExpenses: true,
//         viewExpenses: true,
//         editExpenses: true,
//         deleteExpenses: true,
//         listExpenses: true,

//         addListAccount: true,
//         manageListAccount: true,
//         viewListAccount: true,
//         editListAccount: true,
//         deleteListAccount: true,
//         balanceSheet: true,
//         trialBalance: true,
//         cashFlow: true,
//         paymentAccountReport: true,
//         profitLostReport: true,
//         itemsReport: true,
//         registerReport: true,
//         expensesReport: true,
//         productSellReport: true,
//         productPurchaseReport: true,
//         sellReturnReport: true,
//         purchaseReturnReport: true,
//         stockTransferReport: true,
//         stockAdjustmentReport: true,
//         salesReport: true,
//         purchaseReport: true,
//         trendingProductReport: true,
//         stockExpiryReport: true,
//         stockReport: true,
//         taxReport: true,
//         saleRepresentativeReport: true,
//         customerSupplierReport: true,
//         // HR Access
//         addHr: true,
//         viewHr: true,
//         editHr: true,
//         deleteHr: true,
//         manageHr: true,

//         // Request Salary Access
//         addRequestSalary: true,
//         viewRequestSalary: true,
//         editRequestSalary: true,
//         deleteRequestSalary: true,
//         manageRequestSalary: true,

//         // Request Leave Access
//         addRequestLeave: true,
//         viewRequestLeave: true,
//         editRequestLeave: true,
//         deleteRequestLeave: true,
//         manageRequestLeave: true,

//         // Leave Category Access
//         addLeaveCategory: true,
//         viewLeaveCategory: true,
//         editLeaveCategory: true,
//         deleteLeaveCategory: true,
//         manageLeaveCategory: true,

//         hrReport: true,
//     },
// }

type CreateRoleProps = z.infer<typeof CreateRoleSchema>
export async function createRole(values:CreateRoleProps,path:string) {
        const {
            name,
            displayName,
            description,
            permissions
        } = values;


try {
    const user = await currentUser()
    await connectToDB();

    // Check if any existing role matches the provided name, display name, or description
    const existingRole = await Role.findOne({ displayName, name });

    console.log(existingRole,"existing role")

    // If an existing role is found, throw an error
    if (existingRole) {
        throw new Error('Role with the same name, display name, or description already exists');
    }

    const role = new Role({
        name,
        displayName,
        description,
        permissions,
        createdBy: user?._id,
        action_type: "create",
    });

    const history = new History({
        actionType: 'ROLE_CREATED',
        details: {
            roleId: role._id,
            createdBy: user?._id,
        },
        message: `${user.fullName} created new role with (ID: ${role._id}) on ${new Date().toLocaleString()}.`,
        performedBy: user?._id,
        entityId: role._id,
        entityType: 'ROLE'  // The type of the entity
    });


    await Promise.all([
        role.save(),
        history.save(),
    ]);

    revalidatePath(path)

    console.log("successfully .....")

} catch (error) {
    throw error;
}
}


export async function fetchRoleById(id: string) {
    try {
        await connectToDB();

        const role = await Role.findById(id);

        if (!role) {
            throw new Error('No Role found')
        }


        return JSON.parse(JSON.stringify(role))

    } catch (error) {
        console.error("Error fetching role by id:", error);
        throw error;
    }
}

async function _getAllRoles(user: User) {
    try {


        await connectToDB();
        const roles = await Role.find({ schoolId: user.schoolId });

        if (!roles || roles.length === 0) {
            console.log("Roles don't exist");
            return []
        }

        return JSON.parse(JSON.stringify(roles))

    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
}

export const getAllRoles = await withAuth(_getAllRoles)
export async function getRolesName() {
    try {

        const user = await currentUser();
        if (!user) throw new Error('user not logged in');
        const schoolId = user.schoolId;

        await connectToDB();

        const roles = await Role.find({ schoolId }, { displayName: 1, _id: 1 });


        if (!roles || roles.length === 0) {
            console.log("Roles name don't exist");
            return null; // or throw an error if you want to handle it differently
        }

        return JSON.parse(JSON.stringify(roles))

    } catch (error) {
        console.error("Error fetching roles name:", error);
        throw error;
    }
}


export async function updateRole(roleId: string, values: Partial<CreateRoleProps>, path: string) {
    try {
        const user = await currentUser();
        if (!user) throw new Error('user not logged in');

        await connectToDB();

        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            { $set: values },
            { new: true, runValidators: true }
        );

        if (!updatedRole) {
            console.log("Role not found");
            return null;
        }

        console.log("Update successful");

        revalidatePath(path)

        return JSON.parse(JSON.stringify(updatedRole));
    } catch (error) {
        console.error("Error updating role:", error);
        throw error;
    }
}
async function _fetchRole(user: User, value: string) {
    try {

        const schoolId = user.schoolId
        await connectToDB();

        const role = await Role.findOne({ schoolId, displayName: value });

        if (!role) {
            throw new Error("Role not found");
        }

        return JSON.parse(JSON.stringify(role));

    } catch (error) {
        console.log('Error fetching role', error);
        throw error;
    }

}

export const fetchRole = await withAuth(_fetchRole)

