
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
}

export interface ParkingRecord {
  id: string;
  slotId: string;
  carId: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // in hours
  isActive: boolean;
}

export interface Payment {
  id: string;
  recordId: string;
  amountPaid: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'card' | 'mobile';
  status: 'pending' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'operator';
}
