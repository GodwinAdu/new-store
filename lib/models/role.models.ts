import { Schema, model, models, Model } from "mongoose";

// Define the Role schema
const RoleSchema: Schema<IRole> = new Schema({
    name: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    permissions: {
        manageAccess: {
            type: Boolean,
            default: false,
        },
        manageOnlyPos: {
            type: Boolean,
            default: false,
        },
        dashboard: {
            type: Boolean,
            default: false,
        },
        user: {
            type: Boolean,
            default: false,
        },
        product: {
            type: Boolean,
            default: false,
        },
        sales: {
            type: Boolean,
            default: false,
        },
        purchase: {
            type: Boolean,
            default: false,
        },
        stockTransfer: {
            type: Boolean,
            default: false,
        },
        stockAdjustment: {
            type: Boolean,
            default: false,
        },
        expenses: {
            type: Boolean,
            default: false,
        },
        paymentAccount: {
            type: Boolean,
            default: false,
        },
        report: {
            type: Boolean,
            default: false,
        },
        addRole: {
            type: Boolean,
            default: false,
        },
        manageRole: {
            type: Boolean,
            default: false,
        },
        viewRole: {
            type: Boolean,
            default: false,
        },
        editRole: {
            type: Boolean,
            default: false,
        },
        deleteRole: {
            type: Boolean,
            default: false,
        },
        addUser: {
            type: Boolean,
            default: false,
        },
        manageUser: {
            type: Boolean,
            default: false,
        },
        viewUser: {
            type: Boolean,
            default: false,
        },
        editUser: {
            type: Boolean,
            default: false,
        },
        deleteUser: {
            type: Boolean,
            default: false,
        },
        listProduct: {
            type: Boolean,
            default: false,
        },
        addProduct: {
            type: Boolean,
            default: false,
        },
        manageProduct: {
            type: Boolean,
            default: false,
        },
        viewProduct: {
            type: Boolean,
            default: false,
        },
        editProduct: {
            type: Boolean,
            default: false,
        },
        deleteProduct: {
            type: Boolean,
            default: false,
        },
        addUnit: {
            type: Boolean,
            default: false,
        },
        manageUnit: {
            type: Boolean,
            default: false,
        },
        viewUnit: {
            type: Boolean,
            default: false,
        },
        editUnit: {
            type: Boolean,
            default: false,
        },
        deleteUnit: {
            type: Boolean,
            default: false,
        },
        addBrand: {
            type: Boolean,
            default: false,
        },
        manageBrand: {
            type: Boolean,
            default: false,
        },
        viewBrand: {
            type: Boolean,
            default: false,
        },
        editBrand: {
            type: Boolean,
            default: false,
        },
        deleteBrand: {
            type: Boolean,
            default: false,
        },
        addCategory: {
            type: Boolean,
            default: false,
        },
        manageCategory: {
            type: Boolean,
            default: false,
        },
        viewCategory: {
            type: Boolean,
            default: false,
        },
        editCategory: {
            type: Boolean,
            default: false,
        },
        deleteCategory: {
            type: Boolean,
            default: false,
        },
        addPrintLabel: {
            type: Boolean,
            default: false,
        },
        managePrintLabel: {
            type: Boolean,
            default: false,
        },
        viewPrintLabel: {
            type: Boolean,
            default: false,
        },
        addVariation: {
            type: Boolean,
            default: false,
        },
        manageVariation: {
            type: Boolean,
            default: false,
        },
        viewVariation: {
            type: Boolean,
            default: false,
        },
        editVariation: {
            type: Boolean,
            default: false,
        },
        deleteVariation: {
            type: Boolean,
            default: false,
        },
        manageImportProduct: {
            type: Boolean,
            default: false,
        },
        addSellingGroupPrice: {
            type: Boolean,
            default: false,
        },
        manageSellingGroupPrice: {
            type: Boolean,
            default: false,
        },
        viewSellingGroupPrice: {
            type: Boolean,
            default: false,
        },
        editSellingGroupPrice: {
            type: Boolean,
            default: false,
        },
        deleteSellingGroupPrice: {
            type: Boolean,
            default: false,
        },
        addWarrant: {
            type: Boolean,
            default: false,
        },
        manageWarrant: {
            type: Boolean,
            default: false,
        },
        viewWarrant: {
            type: Boolean,
            default: false,
        },
        editWarrant: {
            type: Boolean,
            default: false,
        },
        deleteWarrant: {
            type: Boolean,
            default: false,
        },
        manageAllSales: {
            type: Boolean,
            default: false,
        },
        addSales: {
            type: Boolean,
            default: false,
        },
        manageSales: {
            type: Boolean,
            default: false,
        },
        viewSales: {
            type: Boolean,
            default: false,
        },
        editSales: {
            type: Boolean,
            default: false,
        },
        deleteSales: {
            type: Boolean,
            default: false,
        },
        addOrder: {
            type: Boolean,
            default: false,
        },
        manageOrder: {
            type: Boolean,
            default: false,
        },
        viewOrder: {
            type: Boolean,
            default: false,
        },
        editOrder: {
            type: Boolean,
            default: false,
        },
        deleteOrder: {
            type: Boolean,
            default: false,
        },
        listOrder: {
            type: Boolean,
            default: false
        },
        listSellReturn: {
            type: Boolean,
            default: false
        },
        importSales: {
            type: Boolean,
            default: false
        },
        listPurchase: {
            type: Boolean,
            default: false
        },
        addPurchase: {
            type: Boolean,
            default: false,
        },
        managePurchase: {
            type: Boolean,
            default: false,
        },
        viewPurchase: {
            type: Boolean,
            default: false,
        },
        editPurchase: {
            type: Boolean,
            default: false,
        },
        deletePurchase: {
            type: Boolean,
            default: false,
        },
        listPurchaseReturn: {
            type: Boolean,
            default: false
        },
        importPurchase: {
            type: Boolean,
            default: false
        },
        listStockTransfer: {
            type: Boolean,
            default: false
        },
        addStockTransfer: {
            type: Boolean,
            default: false,
        },
        manageStockTransfer: {
            type: Boolean,
            default: false,
        },
        viewStockTransfer: {
            type: Boolean,
            default: false,
        },
        editStockTransfer: {
            type: Boolean,
            default: false,
        },
        deleteStockTransfer: {
            type: Boolean,
            default: false,
        },
        listStockAdjustment: {
            type: Boolean,
            default: false
        },
        addStockAdjustment: {
            type: Boolean,
            default: false,
        },
        manageStockAdjustment: {
            type: Boolean,
            default: false,
        },
        viewStockAdjustment: {
            type: Boolean,
            default: false,
        },
        editStockAdjustment: {
            type: Boolean,
            default: false,
        },
        deleteStockAdjustment: {
            type: Boolean,
            default: false,
        },
        addExpensesCategory: {
            type: Boolean,
            default: false,
        },
        manageExpensesCategory: {
            type: Boolean,
            default: false,
        },
        viewExpensesCategory: {
            type: Boolean,
            default: false,
        },
        editExpensesCategory: {
            type: Boolean,
            default: false,
        },
        deleteExpensesCategory: {
            type: Boolean,
            default: false,
        },
        addExpenses: {
            type: Boolean,
            default: false,
        },
        manageExpenses: {
            type: Boolean,
            default: false,
        },
        viewExpenses: {
            type: Boolean,
            default: false,
        },
        editExpenses: {
            type: Boolean,
            default: false,
        },
        deleteExpenses: {
            type: Boolean,
            default: false,
        },
        listExpenses: {
            type: Boolean,
            default: false
        },
        addListAccount: {
            type: Boolean,
            default: false,
        },
        manageListAccount: {
            type: Boolean,
            default: false,
        },
        viewListAccount: {
            type: Boolean,
            default: false,
        },
        editListAccount: {
            type: Boolean,
            default: false,
        },
        deleteListAccount: {
            type: Boolean,
            default: false,
        },
        // HR Access
        addHr: {
            type: Boolean,
            default: false
        },
        viewHr: {
            type: Boolean,
            default: false
        },
        editHr: {
            type: Boolean,
            default: false
        },
        deleteHr: {
            type: Boolean,
            default: false
        },
        manageHr: {
            type: Boolean,
            default: false
        },

        // Request Salary Access
        addRequestSalary: {
            type: Boolean,
            default: false
        },
        viewRequestSalary: {
            type: Boolean,
            default: false
        },
        editRequestSalary: {
            type: Boolean,
            default: false
        },
        deleteRequestSalary: {
            type: Boolean,
            default: false
        },
        manageRequestSalary: {
            type: Boolean,
            default: false
        },

        // Request Leave Access
        addRequestLeave: {
            type: Boolean,
            default: false
        },
        viewRequestLeave: {
            type: Boolean,
            default: false
        },
        editRequestLeave: {
            type: Boolean,
            default: false
        },
        deleteRequestLeave: {
            type: Boolean,
            default: false
        },
        manageRequestLeave: {
            type: Boolean,
            default: false
        },

        // Leave Category Access
        addLeaveCategory: {
            type: Boolean,
            default: false
        },
        viewLeaveCategory: {
            type: Boolean,
            default: false
        },
        editLeaveCategory: {
            type: Boolean,
            default: false
        },
        deleteLeaveCategory: {
            type: Boolean,
            default: false
        },
        manageLeaveCategory: {
            type: Boolean,
            default: false
        },

        hrReport: {
            type: Boolean,
            default: false
        },
        balanceSheet: {
            type: Boolean,
            default: false
        },
        trialBalance: {
            type: Boolean,
            default: false
        },
        cashFlow: {
            type: Boolean,
            default: false
        },
        paymentAccountReport: {
            type: Boolean,
            default: false
        },
        profitLostReport: {
            type: Boolean,
            default: false
        },
        itemsReport: {
            type: Boolean,
            default: false
        },
        registerReport: {
            type: Boolean,
            default: false
        },
        expensesReport: {
            type: Boolean,
            default: false
        },
        productSellReport: {
            type: Boolean,
            default: false
        },
        productPurchaseReport: {
            type: Boolean,
            default: false
        },
        sellReturnReport: {
            type: Boolean,
            default: false
        },
        purchaseReturnReport: {
            type: Boolean,
            default: false
        },
        stockTransferReport: {
            type: Boolean,
            default: false
        },
        stockAdjustmentReport: {
            type: Boolean,
            default: false
        },
        salesReport: {
            type: Boolean,
            default: false
        },
        purchaseReport: {
            type: Boolean,
            default: false
        },
        trendingProductReport: {
            type: Boolean,
            default: false
        },
        stockExpiryReport: {
            type: Boolean,
            default: false
        },
        stockReport: {
            type: Boolean,
            default: false
        },
        taxReport: {
            type: Boolean,
            default: false
        },
        saleRepresentativeReport: {
            type: Boolean,
            default: false
        },
        customerSupplierReport: {
            type: Boolean,
            default: false
        },
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    mod_flag: {
        type: Boolean,
        default: false
    },
    delete_flag: {
        type: Boolean,
        default: false
    },
    modifyBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    action_type: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false,
    minimize: false,
});

// Define the model type
type RoleModel = Model<IRole>;

// Create or retrieve the Role model
const Role: RoleModel = models.Role || model<IRole>("Role", RoleSchema);

export default Role;
