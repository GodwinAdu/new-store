interface WorkSchedule extends Document {
    day: "Monday" | "Tuesday" | " Wednesday " | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string;
    endTime: string;
}

interface IProductBatch extends Document {
    product: mongoose.Types.ObjectId;
    warehouse: mongoose.Types.ObjectId;
    purchasePrice: number;
    quantity: number;
    expiryDate?: Date;
    remaining: number;
    isDepleted: boolean;
    depletedAt: Date;
    createdAt: Date;
}

interface IPurchaseItem {
    product: Schema.Types.ObjectId
    quantity: number;
    unitPrice: number;
}

interface IPurchase extends Document {
    warehouse: Schema.Types.ObjectId
    items: IPurchaseItem[];
    transportCost?: number;
    tax?: number;
    otherExpenses?: number;
    purchaseDate: Date;
    createdBy: Schema.Types.ObjectId;
}

interface IProductStock extends Document {
    product: Schema.Types.ObjectId
    warehouse: Schema.Types.ObjectId
    quantity: number;
    averageCostPrice: number;
    updatedAt: Date;
}

interface IUnit {
    _id: string;
    name: string;
    isActive: boolean
    createdBy: Schema.Types.ObjectId
    modifiedBy: Schema.Types.ObjectId
    del_flag: boolean
    mod_flag: boolean
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown;
}
interface IBrand {
    _id: string;
    name: string;
    isActive: boolean
    createdBy: Schema.Types.ObjectId
    modifiedBy: Schema.Types.ObjectId
    del_flag: boolean
    mod_flag: boolean
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown;
}
interface ICategory {
    _id: string;
    name: string;
    isActive: boolean
    createdBy: Schema.Types.ObjectId
    modifiedBy: Schema.Types.ObjectId
    del_flag: boolean
    mod_flag: boolean
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown;
}