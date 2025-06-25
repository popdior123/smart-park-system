
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParkingSlot, Car, ParkingRecord } from '@/types/parking';
import { Car as CarIcon, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkingSlotGridProps {
  slots: ParkingSlot[];
  onSlotUpdate: (slots: ParkingSlot[]) => void;
  cars: Car[];
  parkingRecords: ParkingRecord[];
  onRecordUpdate: (records: ParkingRecord[]) => void;
}

const ParkingSlotGrid: React.FC<ParkingSlotGridProps> = ({
  slots,
  onSlotUpdate,
  cars,
  parkingRecords,
  onRecordUpdate
}) => {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const { toast } = useToast();

  const assignCarToSlot = () => {
    if (!selectedSlot || !selectedCarId) return;

    const updatedSlots = slots.map(slot =>
      slot.id === selectedSlot.id
        ? { ...slot, slotStatus: 'occupied' as const }
        : slot
    );

    const newRecord: ParkingRecord = {
      id: `record-${Date.now()}`,
      slotId: selectedSlot.id,
      carId: selectedCarId,
      entryTime: new Date(),
      isActive: true
    };

    onSlotUpdate(updatedSlots);
    onRecordUpdate([...parkingRecords, newRecord]);
    setSelectedSlot(null);
    setSelectedCarId('');

    toast({
      title: 'Car Assigned',
      description: `Car assigned to slot ${selectedSlot.slotNumber}`,
    });
  };

  const releaseSlot = (slot: ParkingSlot) => {
    const activeRecord = parkingRecords.find(
      record => record.slotId === slot.id && record.isActive
    );

    if (!activeRecord) return;

    const exitTime = new Date();
    const duration = Math.round(
      (exitTime.getTime() - activeRecord.entryTime.getTime()) / (1000 * 60 * 60)
    );

    const updatedSlots = slots.map(s =>
      s.id === slot.id ? { ...s, slotStatus: 'available' as const } : s
    );

    const updatedRecords = parkingRecords.map(record =>
      record.id === activeRecord.id
        ? { ...record, exitTime, duration, isActive: false }
        : record
    );

    onSlotUpdate(updatedSlots);
    onRecordUpdate(updatedRecords);

    toast({
      title: 'Slot Released',
      description: `Slot ${slot.slotNumber} is now available`,
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

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Parking Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {slots.map((slot) => {
            const assignedCar = getCarForSlot(slot.id);
            return (
              <Card
                key={slot.id}
                className={`cursor-pointer transition-colors ${getSlotColor(slot.slotStatus)}`}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-bold">{slot.slotNumber}</div>
                    <Badge
                      variant={slot.slotStatus === 'available' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {slot.slotStatus}
                    </Badge>
                    {assignedCar && (
                      <div className="text-xs text-gray-600">
                        <CarIcon className="h-3 w-3 inline mr-1" />
                        {assignedCar.plateNumber}
                      </div>
                    )}
                    {slot.slotStatus === 'available' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Car to Slot {slot.slotNumber}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a car" />
                              </SelectTrigger>
                              <SelectContent>
                                {cars.map((car) => (
                                  <SelectItem key={car.id} value={car.id}>
                                    {car.plateNumber} - {car.driverName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={assignCarToSlot} className="w-full">
                              Assign Car
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {slot.slotStatus === 'occupied' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => releaseSlot(slot)}
                      >
                        Release
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </div>
  );
};

export default ParkingSlotGrid;
