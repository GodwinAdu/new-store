"use server"

import { currentUser } from "./session";

/**
 * Check if the current user has access to warehouse features
 * Returns true if user has warehouse assigned or is admin, false otherwise
 */
export async function hasWarehouseAccess(): Promise<boolean> {
    try {
        const user = await currentUser();
        
        if (!user) {
            return false;
        }

        // Admin role has full warehouse access
        if (user.role === "admin") {
            return true;
        }

        // Check if user has warehouse assigned
        return !!(user.warehouse && user.warehouse.length > 0);
    } catch (error) {
        console.error("Error checking warehouse access:", error);
        return false;
    }
}

/**
 * Get user's assigned warehouses
 * Returns array of warehouse IDs or empty array
 */
export async function getUserWarehouses(): Promise<string[]> {
    try {
        const user = await currentUser();
        
        if (!user || !user.warehouse) {
            return [];
        }

        return user.warehouse.map(w => w.toString());
    } catch (error) {
        console.error("Error getting user warehouses:", error);
        return [];
    }
}

/**
 * Check if user has access to a specific warehouse
 */
export async function hasAccessToWarehouse(warehouseId: string): Promise<boolean> {
    try {
        const userWarehouses = await getUserWarehouses();
        return userWarehouses.includes(warehouseId);
    } catch (error) {
        console.error("Error checking warehouse access:", error);
        return false;
    }
}

/**
 * Require warehouse access - throws error if user doesn't have access
 * Use this in server actions or API routes
 */
export async function requireWarehouseAccess(): Promise<void> {
    const hasAccess = await hasWarehouseAccess();
    
    if (!hasAccess) {
        throw new Error("Warehouse access required");
    }
}

/**
 * Get user's primary warehouse (first assigned warehouse)
 * Returns null if no warehouses assigned
 */
export async function getPrimaryWarehouse(): Promise<string | null> {
    try {
        const warehouses = await getUserWarehouses();
        return warehouses.length > 0 ? warehouses[0] : null;
    } catch (error) {
        console.error("Error getting primary warehouse:", error);
        return null;
    }
}