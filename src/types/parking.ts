
export interface ParkingSlot {
  id: string;
  slotNumber: string;
  slotStatus: 'available' | 'occupied' | 'reserved';
  location?: string;
}

export interface Car {
  id: string;
  plateNumber: string;
  driverName: string;
  phoneNumber: string;
  operatorId: string; // Link car to operator
}

export interface ParkingRecord {
  id: string;
  slotId: string;
  carId: string;
  operatorId: string; // Track which operator parked
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // in hours
  isActive: boolean;
  isPaid: boolean; // Track payment status
}

export interface Payment {
  id: string;
  recordId: string;
  operatorId: string; // Track which operator paid
  amountPaid: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'card' | 'mobile';
  status: 'pending' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'admin' | 'operator';
  createdAt: Date;
}
