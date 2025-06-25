
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Car, ParkingRecord } from '@/types/parking';
import { Users, Car as CarIcon } from 'lucide-react';

interface AdminOperatorsProps {
  operators: User[];
  cars: Car[];
  parkingRecords: ParkingRecord[];
}

const AdminOperators: React.FC<AdminOperatorsProps> = ({ operators, cars, parkingRecords }) => {
  const getOperatorStats = (operatorId: string) => {
    const operatorCars = cars.filter(car => car.operatorId === operatorId);
    const activeParkings = parkingRecords.filter(
      record => record.operatorId === operatorId && record.isActive
    ).length;
    
    return {
      totalCars: operatorCars.length,
      activeParkings
    };
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Operators Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Cars</TableHead>
              <TableHead>Active Parkings</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.map((operator) => {
              const stats = getOperatorStats(operator.id);
              
              return (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium">{operator.fullName}</TableCell>
                  <TableCell>{operator.username}</TableCell>
                  <TableCell>{operator.email}</TableCell>
                  <TableCell>{operator.phoneNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CarIcon className="h-4 w-4 mr-1" />
                      {stats.totalCars}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stats.activeParkings > 0 ? 'default' : 'secondary'}>
                      {stats.activeParkings}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stats.activeParkings > 0 ? 'default' : 'secondary'}>
                      {stats.activeParkings > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {operators.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No operators registered yet.
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default AdminOperators;
