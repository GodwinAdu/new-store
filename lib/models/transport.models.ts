import { model, models, Schema } from "mongoose";


const TransportSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    driverContact: { type: String, required: true },
    status: { type: String, enum: ["available", "in-use", "maintenance"], default: "available" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Staff",  },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Staff", },
    del_flag: { type: Boolean, default: false },
    mod_flag: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});

const Transport = models.Transport ?? model("Transport", TransportSchema);

export default Transport;