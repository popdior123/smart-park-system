
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ParkingSlot } from '@/types/parking';
import { MapPin, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminParkingSlotsProps {
  slots: ParkingSlot[];
  onSlotUpdate: (slots: ParkingSlot[]) => void;
}

const AdminParkingSlots: React.FC<AdminParkingSlotsProps> = ({ slots, onSlotUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    slotNumber: '',
    location: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSlot: ParkingSlot = {
      id: `slot-${Date.now()}`,
      slotNumber: formData.slotNumber,
      slotStatus: 'available',
      location: formData.location
    };

    const updatedSlots = [...slots, newSlot];
    onSlotUpdate(updatedSlots);
    localStorage.setItem('parking_slots', JSON.stringify(updatedSlots));
    
    setFormData({ slotNumber: '', location: '' });
    setIsDialogOpen(false);

    toast({
      title: 'Slot Added',
      description: 'New parking slot has been added successfully',
    });
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

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Parking Slots Management
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parking Slot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slotNumber">Slot Number</Label>
                <Input
                  id="slotNumber"
                  value={formData.slotNumber}
                  onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                  placeholder="e.g., A01, B15"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Zone A, Level 1"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add Slot
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {slots.map((slot) => (
            <Card
              key={slot.id}
              className={`transition-colors ${getSlotColor(slot.slotStatus)}`}
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
                  {slot.location && (
                    <div className="text-xs text-gray-600">{slot.location}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </div>
  );
};

export default AdminParkingSlots;
