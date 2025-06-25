
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParkingRecord, Payment, Car } from '@/types/parking';
import { CreditCard, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentProcessingProps {
  parkingRecords: ParkingRecord[];
  payments: Payment[];
  onPaymentUpdate: (payments: Payment[]) => void;
  cars: Car[];
}

const HOURLY_RATE = 500; // RWF per hour

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  parkingRecords,
  payments,
  onPaymentUpdate,
  cars
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const { toast } = useToast();

  const pendingRecords = parkingRecords.filter(record => 
    !record.isActive && record.duration && !payments.some(payment => payment.recordId === record.id)
  );

  const processPayment = () => {
    if (!selectedRecord || !selectedRecord.duration) return;

    const amount = selectedRecord.duration * HOURLY_RATE;
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      recordId: selectedRecord.id,
      amountPaid: amount,
      paymentDate: new Date(),
      paymentMethod,
      status: 'completed'
    };

    onPaymentUpdate([...payments, newPayment]);
    setSelectedRecord(null);

    toast({
      title: 'Payment Processed',
      description: `Payment of ${amount} RWF processed successfully`,
    });
  };

  const getCarForRecord = (record: ParkingRecord) => {
    return cars.find(car => car.id === record.carId);
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
          Payment Processing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Pending Payments</h3>
          {pendingRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRecords.map((record) => {
                  const car = getCarForRecord(record);
                  const amount = (record.duration || 0) * HOURLY_RATE;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {car?.plateNumber || 'Unknown'}
                      </TableCell>
                      <TableCell>{car?.driverName || 'Unknown'}</TableCell>
                      <TableCell>{formatDuration(record.duration || 0)}</TableCell>
                      <TableCell className="font-bold">{amount} RWF</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              Process Payment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Process Payment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold">Payment Details</h4>
                                <p>Car: {car?.plateNumber}</p>
                                <p>Driver: {car?.driverName}</p>
                                <p>Duration: {formatDuration(record.duration || 0)}</p>
                                <p className="text-lg font-bold">Amount: {amount} RWF</p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="mobile">Mobile Money</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={processPayment} className="w-full">
                                <Receipt className="h-4 w-4 mr-2" />
                                Process Payment
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending payments at the moment.
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Car</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(-10).reverse().map((payment) => {
                  const record = parkingRecords.find(r => r.id === payment.recordId);
                  const car = record ? getCarForRecord(record) : null;
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.paymentDate.toLocaleDateString()} {payment.paymentDate.toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{car?.plateNumber || 'Unknown'}</TableCell>
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payments processed yet.
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default PaymentProcessing;
