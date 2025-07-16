import { models, model, Schema, UpdateQuery } from "mongoose";
import RevenueSummary from "./revenue-summary.models";


const ExpenseSchema = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    expenseDate: {
        type: Date,
        default: Date.now()
    },
    referenceNo: {
        type: String,
    },
    expenseFor: {
        type: String,
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    expenseNote: {
        type: String,
    },
    isRefund: {
        type: Boolean,
        default: false,
    },
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringInterval: {
            type: String,
            default: "1 day",
        },
        repetition: {
            type: Number,
            default: 1,
        },
    },
    paymentDate: {
        type: Date,
        default: Date.now(),
    },
    paymentMethod: {
        type: String,
    },
    paymentAmount: {
        type: Number,
        default: 0,
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        default: null,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    mod_flag: {
        type: Boolean,
        default: false,
    },
    del_flag: {
        type: Boolean,
        default: false,
    },
    action_type: {
        type: String,
    }
}, {
    timestamps: true,
    versionKey: false,
});

ExpenseSchema.post("save", async function (doc) {
    try {
        const { totalAmount, expenseDate } = doc;
        const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);

        await RevenueSummary.updateOne(
            { date: startOfMonth },
            { $inc: { totalRevenue: -totalAmount } },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error updating revenue summary:", error);
    }
});

ExpenseSchema.post("findOneAndUpdate", async function (doc) {
    try {
        const { expenseDate } = doc;
        const update = this.getUpdate();
        const updatedAmount = (update as UpdateQuery<typeof doc>)?.$set?.totalAmount || doc.totalAmount;
        const originalAmount = doc.totalAmount || 0;
        const difference = (updatedAmount || 0) - originalAmount;

        if (difference !== 0) {
            const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);

            await RevenueSummary.updateOne(
                { date: startOfMonth },
                { $inc: { totalRevenue: -difference } }
            );
        }
    } catch (error) {
        console.error("Error updating revenue summary on edit:", error);
    }
});

ExpenseSchema.post("findOneAndDelete", async function (doc) {
    try {
        const { totalAmount, expenseDate } = doc;

        if (expenseDate) {
            const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);

            await RevenueSummary.updateOne(
                { date: startOfMonth },
                { $inc: { totalRevenue: -totalAmount } }
            );
        }
    } catch (error) {
        console.error("Error updating revenue summary on delete:", error);
    }
});


const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;