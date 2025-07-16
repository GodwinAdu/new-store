import { model, models, Schema } from "mongoose";

const WarehouseSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    location: { type: String },
    description: { type: String },
    capacity: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Staff',
        default:null
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Staff',
        default:null
    },
    del_flag: {
        type: Boolean,
        default: false,
    },
    mod_flag: {
        type: Boolean,
        default: false,
    },

}, {
    timestamps: true,
    versionKey: false,
});


const Warehouse = models.Warehouse ?? model("Warehouse", WarehouseSchema);

export default Warehouse;


