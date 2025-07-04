
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParkingSlot, Car, ParkingRecord } from '@/types/parking';
import { Car as CarIcon, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OperatorParkingGridProps {
  slots: ParkingSlot[];
  cars: Car[];
  parkingRecords: ParkingRecord[];
  onRecordUpdate: (records: ParkingRecord[]) => void;
  operatorId: string;
}

const OperatorParkingGrid: React.FC<OperatorParkingGridProps> = ({
  slots,
  cars,
  parkingRecords,
  onRecordUpdate,
  operatorId
}) => {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const { toast } = useToast();

  const assignCarToSlot = () => {
    if (!selectedSlot || !selectedCarId) return;

    // Check if car is already parked somewhere
    const carAlreadyParked = parkingRecords.find(
      record => record.carId === selectedCarId && record.isActive
    );

    if (carAlreadyParked) {
      toast({
        title: 'Car Already Parked',
        description: 'This car is already parked in another slot. Please release it first.',
        variant: 'destructive'
      });
      return;
    }

    const newRecord: ParkingRecord = {
      id: `record-${Date.now()}`,
      slotId: selectedSlot.id,
      carId: selectedCarId,
      operatorId,
      entryTime: new Date(),
      isActive: true,
      isPaid: false
    };

    const updatedRecords = [...parkingRecords, newRecord];
    onRecordUpdate(updatedRecords);
    
    // Update slot status in localStorage
    const allSlots = JSON.parse(localStorage.getItem('parking_slots') || '[]');
    const updatedSlots = allSlots.map((slot: ParkingSlot) =>
      slot.id === selectedSlot.id
        ? { ...slot, slotStatus: 'occupied' }
        : slot
    );
    localStorage.setItem('parking_slots', JSON.stringify(updatedSlots));
    
    // Update localStorage records
    const allRecords = JSON.parse(localStorage.getItem('parking_records') || '[]');
    localStorage.setItem('parking_records', JSON.stringify([...allRecords, newRecord]));
    
    setSelectedSlot(null);
    setSelectedCarId('');

    toast({
      title: 'Car Assigned',
      description: `Car assigned to slot ${selectedSlot.slotNumber}`,
    });
  };

  const getSlotColor = (status: ParkingSlot['slotStatus']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'occupied':
        return 'bg-red-100 border-red-300';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getCarForSlot = (slotId: string) => {
    const activeRecord = parkingRecords.find(
      record => record.slotId === slotId && record.isActive
    );
    if (!activeRecord) return null;
    return cars.find(car => car.id === activeRecord.carId);
  };

  const canAssignToSlot = (slotId: string) => {
    const activeRecord = parkingRecords.find(
      record => record.slotId === slotId && record.isActive
    );
    return !activeRecord;
  };

  const isSlotOccupiedByOperator = (slotId: string) => {
    const activeRecord = parkingRecords.find(
      record => record.slotId === slotId && record.isActive && record.operatorId === operatorId
    );
    return !!activeRecord;
  };

  // Get available cars that are not currently parked
  const availableCars = cars.filter(car => {
    const isParked = parkingRecords.find(
      record => record.carId === car.id && record.isActive
    );
    return !isParked;
  });

  // Filter slots to show only available ones and ones occupied by current operator
  const visibleSlots = slots.filter(slot => {
    const activeRecord = parkingRecords.find(
      record => record.slotId === slot.id && record.isActive
    );
    
    // Show if available or occupied by current operator
    return !activeRecord || activeRecord.operatorId === operatorId;
  });

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Available Parking Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {visibleSlots.map((slot) => {
            const assignedCar = getCarForSlot(slot.id);
            const isAvailable = canAssignToSlot(slot.id);
            const isOccupiedByMe = isSlotOccupiedByOperator(slot.id);
            
            return (
              <Card
                key={slot.id}
                className={`cursor-pointer transition-colors ${getSlotColor(isAvailable ? 'available' : 'occupied')}`}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-bold">{slot.slotNumber}</div>
                    <Badge
                      variant={isAvailable ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {isAvailable ? 'available' : 'occupied'}
                    </Badge>
                    {assignedCar && isOccupiedByMe && (
                      <div className="text-xs text-gray-600">
                        <CarIcon className="h-3 w-3 inline mr-1" />
                        {assignedCar.plateNumber}
                      </div>
                    )}
                    {isAvailable && availableCars.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            Park Here
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Park Car in Slot {slot.slotNumber}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your car" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCars.map((car) => (
                                  <SelectItem key={car.id} value={car.id}>
                                    {car.plateNumber} - {car.driverName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={assignCarToSlot} className="w-full">
                              Park Car
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {availableCars.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            All your cars are currently parked or you need to register a car first.
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default OperatorParkingGrid;
