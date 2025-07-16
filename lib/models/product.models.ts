import { model, models, Schema } from "mongoose";


const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [2, "Name must be at least 2 characters."],
    },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", default: null },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    barcode: { type: String, },
    sku: { type: String, },
    description: { type: String },
    tags: [{ type: String }],
    color: [{ type: String }],
    size: [{ type: String }],
    unit: [{
        type: Schema.Types.ObjectId,
        ref: "Unit",
        default: null,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Staff",
       default:null
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "Staff",
       default:null
    },
    del_flag: {
        type: Boolean,
        default: false
    },
    mod_flag: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true,
    versionKey: false
});


const Product = models.Product || model("Product", ProductSchema);

export default Product;