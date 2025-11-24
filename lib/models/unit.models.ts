
import { Model, model, models, Schema } from "mongoose";

const UnitSchema: Schema<IUnit> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    shortName: {
        type: String,
        trim: true
    },
    baseUnit: {
        type: Schema.Types.ObjectId,
        ref: "Unit"
    },
    conversionFactor: {
        type: Number,
        required: true,
        default: 1
    },
    unitType: {
        type: String,
        enum: ["base", "derived"],
        required: true,
        default: "base"
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Staff", },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Staff", },
    del_flag: { type: Boolean, default: false },
    mod_flag: { type: Boolean, default: false },
}, {
    timestamps: true
});

type UnitModel = Model<IUnit>

const Unit: UnitModel = models.Unit ?? model<IUnit>('Unit', UnitSchema);

export default Unit