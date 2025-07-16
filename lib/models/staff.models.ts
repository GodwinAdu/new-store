import { model, models, Schema, Model } from "mongoose";
export interface Address {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}

const AddressSchema = new Schema<Address>({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
});
const WorkScheduleSchema = new Schema<WorkSchedule>({
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    startTime: { type: String }, // Example: "09:00"
    endTime: { type: String },   // Example: "17:00"
});


// Schema definition
const StaffSchema = new Schema<IStaff>({
        username: {
            type: String,
            unique: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            default: null
        },
        emergencyNumber: {
            type: String,
            default: null,
        },
        dob: {
            type: Date,
            default: null
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        avatarUrl: {
            type: String, // Optional profile image URL
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        availableAllSchedule: {
            type: Boolean,
            default: false,
        },
        address: { type: AddressSchema },
        isVerified: {
            type: Boolean,
            default: false,
        },
        jobTitle: {
            type: String,
            default: null,
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        workSchedule: { type: [WorkScheduleSchema], default: [] }, // Array of schedule entries
        workLocation: {
            type: String,
            enum: ["on-site", "remote", "hybrid"],
            default: "on-site",
        },
        warehouse: [{
            type: Schema.Types.ObjectId,
            ref: "Warehouse",
            default: null,
        }],
        cardDetails: {
            idCardType: {
                type: String,
                default: null,
            },
            idCardNumber: {
                type: String,
                default: null,
            },

        },
        accountDetails: {
            accountName: {
                type: String,
                default: null,
            },
            accountNumber: {
                type: String,
                default: null,
            },
            accountType: {
                type: String,
                default: null,
            }
        },
        startDate: {
            type: Date,
            default: null,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer-not-to-say"],
            default: "prefer-not-to-say",
        },
        bio: { type: String, trim: true },
        requirePasswordChange: { type: Boolean, default: true },
        isBanned: { type: Boolean, default: false },
        onLeave: { type: Boolean, default: false },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Staff",
            default: null,
        },
        modifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "Staff",
            default: null,
        },
        del_flag: {
            type: Boolean,
            default: false,
        },
        mod_flag: {
            type: Boolean,
            default: false,
        },
        action_type: {
            type: String,
            enum: ["created", "updated", "deleted", "restored"],
            default: "created",
        },
    },
    {
        timestamps: true,
    });

// Export model with typing
const Staff: Model<IStaff> = models.Staff ?? model<IStaff>("Staff", StaffSchema);

export default Staff;
