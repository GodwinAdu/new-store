import { model, models, Schema } from "mongoose";


// Define an enum for action types
const actionTypes = [
    'ACCOUNT_CREATED',
    'ACCOUNT_UPDATED',
    'ACCOUNT_DELETED',
    'ACCOUNT_RESTORED',

    'UNIT_CREATED',
    'UNIT_UPDATED',
    'UNIT_DELETED',
    'UNIT_RESTORED',

    "BRAND_CREATED",
    'BRAND_UPDATED',
    'BRAND_DELETED',
    'BRAND_RESTORED',

    'CATEGORY_CREATED',
    'CATEGORY_UPDATED',
    'CATEGORY_DELETED',
    'CATEGORY_RESTORED',

    'PRODUCT_CREATED',
    'PRODUCT_UPDATED',
    'PRODUCT_DELETED',
    'PRODUCT_RESTORED',

    'STAFF_CREATED',
    'STAFF_UPDATED',
    'STAFF_DELETED',
    'STAFF_RESTORED',
    'STAFF_PASSWORD_RESET',
    'STAFF_PASSWORD_CHANGED',
    'STAFF_PROFILE_UPDATED',

    'INVENTORY_CATEGORY_CREATED',
    'INVENTORY_CATEGORY_UPDATED',
    'INVENTORY_CATEGORY_DELETED',
    'INVENTORY_CATEGORY_RESTORED',

    'INVENTORY_ISSUE_CREATED',
    'INVENTORY_ISSUE_UPDATED',
    'INVENTORY_ISSUE_DELETED',
    'INVENTORY_ISSUE_RESTORED',

    'INVENTORY_PRODUCT_CREATED',
    'INVENTORY_PRODUCT_UPDATED',
    'INVENTORY_PRODUCT_DELETED',
    'INVENTORY_PRODUCT_RESTORED',

    'INVENTORY_PURCHASE_CREATED',
    'INVENTORY_PURCHASE_UPDATED',
    'INVENTORY_PURCHASE_DELETED',
    'INVENTORY_PURCHASE_RESTORED',

    'INVENTORY_STORE_CREATED',
    'INVENTORY_STORE_UPDATED',
    'INVENTORY_STORE_DELETED',
    'INVENTORY_STORE_RESTORED',

    'INVENTORY_SUPPLIER_CREATED',
    'INVENTORY_SUPPLIER_UPDATED',
    'INVENTORY_SUPPLIER_DELETED',
    'INVENTORY_SUPPLIER_RESTORED',

    'LEAVE_CATEGORY_CREATED',
    'LEAVE_CATEGORY_UPDATED',
    'LEAVE_CATEGORY_DELETED',
    'LEAVE_CATEGORY_RESTORED',

    'ROLE_CREATED',
    'ROLE_UPDATED',
    'ROLE_DELETED',
    'ROLE_RESTORED',

    'TRANSPORT_CREATED',
    'TRANSPORT_UPDATED',
    'TRANSPORT_DELETED',
    'TRANSPORT_RESTORED',

    'WAREHOUSE_CREATED',
    'WAREHOUSE_UPDATED',
    'WAREHOUSE_DELETED',
    'WAREHOUSE_RESTORED',

];

const historySchema = new Schema(
    {
        actionType: {
            type: String,
            enum: actionTypes,
            required: true,
        },
        details: {
            type: Schema.Types.Mixed, // For dynamic details (e.g., JSON object)
            required: true,
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Staff', // Reference to the user who performed the action
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            required: false, // ID of the affected entity (e.g., product, sale, user)
        },
        message: {
            type: String, // Optional message about the action
        },
        entityType: {
            type: String,
            required: false, // Type of entity affected (e.g., 'Product', 'Sale', 'User')
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

const History = models.History || model('History', historySchema);

export default History;
