
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Car } from '@/types/parking';
import { Car as CarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CarRegistrationProps {
  cars: Car[];
  onCarsUpdate: (cars: Car[]) => void;
  operatorId: string;
}

const CarRegistration: React.FC<CarRegistrationProps> = ({ cars, onCarsUpdate, operatorId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    driverName: '',
    phoneNumber: ''
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      driverName: '',
      phoneNumber: ''
    });
    setEditingCar(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCar) {
      // Update existing car
      const updatedCars = cars.map(car =>
        car.id === editingCar.id
          ? { ...car, ...formData }
          : car
      );
      onCarsUpdate(updatedCars);
      
      // Update localStorage
      const allCars = JSON.parse(localStorage.getItem('parking_cars') || '[]');
      const updatedAllCars = allCars.map((car: Car) =>
        car.id === editingCar.id ? { ...car, ...formData } : car
      );
      localStorage.setItem('parking_cars', JSON.stringify(updatedAllCars));
      
      toast({
        title: 'Car Updated',
        description: 'Car information has been updated successfully',
      });
    } else {
      // Add new car
      const newCar: Car = {
        id: `car-${Date.now()}`,
        operatorId,
        ...formData
      };
      const updatedCars = [...cars, newCar];
      onCarsUpdate(updatedCars);
      
      // Update localStorage
      const allCars = JSON.parse(localStorage.getItem('parking_cars') || '[]');
      localStorage.setItem('parking_cars', JSON.stringify([...allCars, newCar]));
      
      toast({
        title: 'Car Registered',
        description: 'New car has been registered successfully',
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      plateNumber: car.plateNumber,
      driverName: car.driverName,
      phoneNumber: car.phoneNumber
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (carId: string) => {
    const updatedCars = cars.filter(car => car.id !== carId);
    onCarsUpdate(updatedCars);
    
    // Update localStorage
    const allCars = JSON.parse(localStorage.getItem('parking_cars') || '[]');
    const updatedAllCars = allCars.filter((car: Car) => car.id !== carId);
    localStorage.setItem('parking_cars', JSON.stringify(updatedAllCars));
    
    toast({
      title: 'Car Deleted',
      description: 'Car has been removed from the system',
    });
  };

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <CarIcon className="h-5 w-5 mr-2" />
          My Cars
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Car
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCar ? 'Edit Car' : 'Add New Car'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  placeholder="e.g., RAB 123A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Enter driver's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g., +250 788 123 456"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCar ? 'Update Car' : 'Add Car'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Driver Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell className="font-medium">{car.plateNumber}</TableCell>
                <TableCell>{car.driverName}</TableCell>
                <TableCell>{car.phoneNumber}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(car)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(car.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {cars.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cars registered yet. Click "Add Car" to register your first car.
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default CarRegistration;
