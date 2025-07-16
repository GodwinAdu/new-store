
import { Model, model, models, Schema } from "mongoose";

const BrandSchema: Schema<IBrand> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Staff", },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Staff", },
    del_flag: { type: Boolean, default: false },
    mod_flag: { type: Boolean, default: false },
});

type BrandModel = Model<IBrand>

const Brand: BrandModel = models.Brand ?? model<IBrand>('Brand', BrandSchema);

export default Brand