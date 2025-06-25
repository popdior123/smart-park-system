
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParkingSlot, ParkingRecord, Car } from '@/types/parking';
import { MapPin, Plus, Car as CarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminParkingSlotsProps {
  slots: ParkingSlot[];
  onSlotUpdate: (slots: ParkingSlot[]) => void;
}

const AdminParkingSlots: React.FC<AdminParkingSlotsProps> = ({ slots, onSlotUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [formData, setFormData] = useState({
    numberOfSlots: '',
    zone: '',
    level: ''
  });
  const { toast } = useToast();

  // Load parking records to determine actual slot status
  useEffect(() => {
    const storedRecords = localStorage.getItem('parking_records');
    if (storedRecords) {
      const records = JSON.parse(storedRecords);
      setParkingRecords(records);
    }

    const storedCars = localStorage.getItem('parking_cars');
    if (storedCars) {
      setCars(JSON.parse(storedCars));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numberOfSlots || !formData.zone || !formData.level) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const numberOfSlots = parseInt(formData.numberOfSlots);
    if (numberOfSlots <= 0) {
      toast({
        title: 'Invalid Number',
        description: 'Number of slots must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    // Find existing slots in the same zone and level to determine the next slot number
    const existingSlotsInZone = slots.filter(slot => 
      slot.location === `Zone ${formData.zone}, Level ${formData.level}`
    );
    const nextSlotNumber = existingSlotsInZone.length + 1;

    const newSlots: ParkingSlot[] = [];
    for (let i = 0; i < numberOfSlots; i++) {
      const slotNumber = `${formData.zone}${String(nextSlotNumber + i).padStart(2, '0')}`;
      const newSlot: ParkingSlot = {
        id: `slot-${Date.now()}-${i}`,
        slotNumber,
        slotStatus: 'available',
        location: `Zone ${formData.zone}, Level ${formData.level}`
      };
      newSlots.push(newSlot);
    }

    const updatedSlots = [...slots, ...newSlots];
    onSlotUpdate(updatedSlots);
    localStorage.setItem('parking_slots', JSON.stringify(updatedSlots));
    
    setFormData({ numberOfSlots: '', zone: '', level: '' });
    setIsDialogOpen(false);

    toast({
      title: 'Slots Added',
      description: `${numberOfSlots} parking slots have been added successfully`,
    });
  };

  const getActualSlotStatus = (slotId: string): ParkingSlot['slotStatus'] => {
    const activeRecord = parkingRecords.find(
      record => record.slotId === slotId && record.isActive
    );
    return activeRecord ? 'occupied' : 'available';
  };

  const getSlotColor = (status: ParkingSlot['slotStatus']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300';
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

  const getSlotStatistics = () => {
    const total = slots.length;
    const occupied = slots.filter(slot => getActualSlotStatus(slot.id) === 'occupied').length;
    const available = total - occupied;
    return { total, occupied, available };
  };

  const stats = getSlotStatistics();

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Parking Slots Management
          </CardTitle>
          <div className="flex space-x-4 mt-2">
            <Badge variant="secondary">Total: {stats.total}</Badge>
            <Badge variant="destructive">Occupied: {stats.occupied}</Badge>
            <Badge variant="default">Available: {stats.available}</Badge>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Slots
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parking Slots</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Select value={formData.zone} onValueChange={(value) => setFormData({ ...formData, zone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Zone A</SelectItem>
                    <SelectItem value="B">Zone B</SelectItem>
                    <SelectItem value="C">Zone C</SelectItem>
                    <SelectItem value="D">Zone D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfSlots">Number of Slots to Add</Label>
                <Input
                  id="numberOfSlots"
                  type="number"
                  min="1"
                  value={formData.numberOfSlots}
                  onChange={(e) => setFormData({ ...formData, numberOfSlots: e.target.value })}
                  placeholder="e.g., 10"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add {formData.numberOfSlots} Slots
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {slots.map((slot) => {
            const actualStatus = getActualSlotStatus(slot.id);
            const assignedCar = getCarForSlot(slot.id);
            
            return (
              <Card
                key={slot.id}
                className={`transition-colors ${getSlotColor(actualStatus)}`}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-bold">{slot.slotNumber}</div>
                    <Badge
                      variant={actualStatus === 'available' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {actualStatus}
                    </Badge>
                    {assignedCar && (
                      <div className="text-xs text-gray-600">
                        <CarIcon className="h-3 w-3 inline mr-1" />
                        {assignedCar.plateNumber}
                      </div>
                    )}
                    {slot.location && (
                      <div className="text-xs text-gray-500">{slot.location}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {slots.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No parking slots added yet. Click "Add Slots" to get started.
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default AdminParkingSlots;
