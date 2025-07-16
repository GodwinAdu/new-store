// models/Purchase.ts

import { Schema, models, model } from 'mongoose';


const purchaseSchema = new Schema<IPurchase>({
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true,
    },
    items: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
        },
    ],
    transportCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    purchaseDate: { type: Date, default: Date.now },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"Staff",
        required:true
    }
}, { timestamps: true });

const Purchase = models.Purchase ?? model<IPurchase>('Purchase', purchaseSchema);

export default Purchase;
