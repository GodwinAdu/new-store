interface WorkSchedule extends Document {
    day: "Monday" | "Tuesday" | " Wednesday " | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string;
    endTime: string;
}

interface IStaff extends Document {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    emergencyNumber?: string;
    dob?: Date;
    password: string;
    role: string;
    avatarUrl?: string;
    isActive: boolean;
    availableAllSchedule: boolean;
    address?: Address;
    isVerified: boolean;
    jobTitle?: string;
    departmentId: Schema.Types.ObjectId;
    workSchedule: WorkSchedule[];
    workLocation: "on-site" | "remote" | "hybrid";
    warehouse: Schema.Types.ObjectId[];
    cardDetails?: {
        idCardType?: string;
        idCardNumber?: string;
    };
    accountDetails?: {
        accountName?: string;
        accountNumber?: string;
        accountType?: string;
    };
    startDate?: Date;
    gender: "male" | "female" | "other" | "prefer-not-to-say";
    bio?: string;
    requirePasswordChange: boolean;
    isBanned: boolean;
    onLeave: boolean;
    createdBy?: Schema.Types.ObjectId;
    modifiedBy?: Schema.Types.ObjectId;
    del_flag: boolean;
    mod_flag: boolean;
    action_type: "created" | "updated" | "deleted" | "restored";
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
}

interface IProductBatch extends Document {
    _id?: string
    product: mongoose.Types.ObjectId;
    warehouseId: mongoose.Types.ObjectId;
    batchNumber: string;
    unitCost: number; // Total cost including shipping
    originalUnitCost?: number; // Original cost without shipping
    shippingCostPerUnit?: number; // Shipping cost per unit
    sellingPrice: number;
    quantity: number;
    expiryDate?: Date;
    remaining: number;
    isDepleted: boolean;
    depletedAt?: Date;
    purchaseOrder?: mongoose.Types.ObjectId; // Source purchase order
    receivedDate?: Date; // When batch was received
    createdBy?: Schema.Types.ObjectId
    modifiedBy?: Schema.Types.ObjectId
    del_flag?: boolean
    mod_flag?: boolean
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown;
}

interface IPurchaseItem {
    product: Schema.Types.ObjectId
    unit: Schema.Types.ObjectId // Selected unit for purchase
    quantity: number; // Quantity in selected unit
    baseQuantity: number; // Converted quantity in base units
    unitPrice: number; // Price per selected unit
    baseUnitPrice: number; // Price per base unit
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

interface IUnit extends Document {
    _id: string;
    name: string;
    shortName?: string;
    baseUnit?: Schema.Types.ObjectId; // Reference to base unit (e.g., piece)
    conversionFactor: number; // How many base units this unit contains
    unitType: "base" | "derived"; // base = piece, derived = box/dozen
    isActive: boolean
    createdBy: Schema.Types.ObjectId
    modifiedBy: Schema.Types.ObjectId
    del_flag: boolean
    mod_flag: boolean
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown;
}
interface IBrand extends Document {
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
interface ICategory extends Document {
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

interface ISupplier extends Document {
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    status: "active" | "inactive" | "pending"
    rating: number
    totalOrders: number
    totalSpent: number
    paymentTerms: string
    category: string
    joinDate: Date
    lastOrderDate: Date
    website?: string
    taxId?: string
    bankAccount?: string
    creditLimit: number
    currentBalance: number
    createdBy: Schema.Types.ObjectId
    modifiedBy: Schema.Types.ObjectId
    del_flag: boolean
    mod_flag: boolean
    createdAt: Date
    updatedAt: Date
}