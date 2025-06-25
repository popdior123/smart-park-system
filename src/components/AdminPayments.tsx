
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Payment, ParkingRecord, Car, User } from '@/types/parking';
import { CreditCard } from 'lucide-react';

interface AdminPaymentsProps {
  payments: Payment[];
  parkingRecords: ParkingRecord[];
  cars: Car[];
  operators: User[];
}

const AdminPayments: React.FC<AdminPaymentsProps> = ({ 
  payments, 
  parkingRecords, 
  cars, 
  operators 
}) => {
  const getPaymentDetails = (payment: Payment) => {
    const record = parkingRecords.find(r => r.id === payment.recordId);
    const car = record ? cars.find(c => c.id === record.carId) : null;
    const operator = operators.find(o => o.id === payment.operatorId);
    
    return {
      record,
      car,
      operator
    };
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return '< 1 hour';
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.slice(-20).reverse().map((payment) => {
              const { record, car, operator } = getPaymentDetails(payment);
              
              return (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.paymentDate.toLocaleDateString()} {payment.paymentDate.toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{operator?.fullName || 'Unknown'}</TableCell>
                  <TableCell className="font-medium">
                    {car?.plateNumber || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {record?.duration ? formatDuration(record.duration) : 'Unknown'}
                  </TableCell>
                  <TableCell className="font-bold">{payment.amountPaid} RWF</TableCell>
                  <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {payments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payments recorded yet.
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default AdminPayments;
