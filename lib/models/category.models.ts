
import { Model, model, models, Schema } from "mongoose";

const CategorySchema: Schema<ICategory> = new Schema({
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

type CategoryModel = Model<ICategory>

const Category: CategoryModel = models.Category ?? model<ICategory>('Category', CategorySchema);

export default Category