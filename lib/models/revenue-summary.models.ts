import { Schema, model, models } from "mongoose";

const RevenueSummarySchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        totalRevenue: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true, versionKey: false }
);

const RevenueSummary = models.RevenueSummary || model("RevenueSummary", RevenueSummarySchema);

export default RevenueSummary;
