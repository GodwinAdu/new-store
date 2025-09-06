import { Schema, models, model } from 'mongoose';

export interface IVehicle {
  plateNumber: string;
  type: string;
  capacity: string;
  status: 'available' | 'in-transit' | 'maintenance' | 'out-of-service';
  driver: string;
  lastMaintenance: Date;
  nextMaintenance?: Date;
  fuelType?: string;
  mileage?: number;
}

const vehicleSchema = new Schema<IVehicle>({
  plateNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  capacity: { type: String, required: true },
  status: {
    type: String,
    enum: ['available', 'in-transit', 'maintenance', 'out-of-service'],
    default: 'available'
  },
  driver: { type: String, required: true },
  lastMaintenance: { type: Date, required: true },
  nextMaintenance: Date,
  fuelType: String,
  mileage: { type: Number, default: 0 }
}, { timestamps: true });

const Vehicle = models.Vehicle ?? model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;