
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParkingRecord, Payment, Car } from '@/types/parking';
import { CreditCard, Receipt, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OperatorPaymentsProps {
  parkingRecords: ParkingRecord[];
  payments: Payment[];
  onPaymentUpdate: (payments: Payment[]) => void;
  onRecordUpdate: (records: ParkingRecord[]) => void;
  cars: Car[];
  operatorId: string;
}

const HOURLY_RATE = 500; // RWF per hour

const OperatorPayments: React.FC<OperatorPaymentsProps> = ({
  parkingRecords,
  payments,
  onPaymentUpdate,
  onRecordUpdate,
  cars,
  operatorId
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('mobile');
  const { toast } = useToast();

  const unpaidRecords = parkingRecords.filter(record => 
    !record.isActive && record.duration && !record.isPaid
  );

  const paidRecords = parkingRecords.filter(record => record.isPaid);

  const processPayment = () => {
    if (!selectedRecord || !selectedRecord.duration) return;

    const amount = selectedRecord.duration * HOURLY_RATE;
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      recordId: selectedRecord.id,
      operatorId,
      amountPaid: amount,
      paymentDate: new Date(),
      paymentMethod,
      status: 'completed'
    };

    // Update records to mark as paid
    const updatedRecords = parkingRecords.map(record =>
      record.id === selectedRecord.id
        ? { ...record, isPaid: true }
        : record
    );

    const updatedPayments = [...payments, newPayment];
    
    onPaymentUpdate(updatedPayments);
    onRecordUpdate(updatedRecords);
    
    // Update localStorage
    localStorage.setItem('parking_payments', JSON.stringify([...JSON.parse(localStorage.getItem('parking_payments') || '[]'), newPayment]));
    localStorage.setItem('parking_records', JSON.stringify(updatedRecords));
    
    setSelectedRecord(null);

    toast({
      title: 'Payment Processed',
      description: `Payment of ${amount} RWF processed successfully. You can now release the slot.`,
    });
  };

  const releaseSlot = (recordId: string) => {
    const record = parkingRecords.find(r => r.id === recordId);
    if (!record || !record.isPaid) {
      toast({
        title: 'Cannot Release Slot',
        description: 'Please pay the bill first before releasing the slot.',
        variant: 'destructive'
      });
      return;
    }

    // Update parking slots to available
    const slots = JSON.parse(localStorage.getItem('parking_slots') || '[]');
    const updatedSlots = slots.map((slot: any) =>
      slot.id === record.slotId
        ? { ...slot, slotStatus: 'available' }
        : slot
    );
    localStorage.setItem('parking_slots', JSON.stringify(updatedSlots));

    toast({
      title: 'Slot Released',
      description: 'Parking slot has been released successfully.',
    });
  };

  const getCarForRecord = (record: ParkingRecord) => {
    return cars.find(car => car.id === record.carId);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return '< 1 hour';
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const downloadReceipt = (payment: Payment) => {
    const record = parkingRecords.find(r => r.id === payment.recordId);
    const car = record ? getCarForRecord(record) : null;
    
    const receiptData = {
      paymentId: payment.id,
      car: car?.plateNumber || 'Unknown',
      driver: car?.driverName || 'Unknown',
      amount: payment.amountPaid,
      date: payment.paymentDate.toLocaleDateString(),
      method: payment.paymentMethod,
      duration: record?.duration ? formatDuration(record.duration) : 'Unknown'
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${payment.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Receipt Downloaded',
      description: 'Receipt has been downloaded successfully.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Unpaid Bills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Unpaid Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unpaidRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidRecords.map((record) => {
                  const car = getCarForRecord(record);
                  const amount = (record.duration || 0) * HOURLY_RATE;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {car?.plateNumber || 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDuration(record.duration || 0)}</TableCell>
                      <TableCell className="font-bold">{amount} RWF</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              Pay Now
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
              No unpaid bills at the moment.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paid Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Car</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(-10).reverse().map((payment) => {
                  const record = parkingRecords.find(r => r.id === payment.recordId);
                  const car = record ? getCarForRecord(record) : null;
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.paymentDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{car?.plateNumber || 'Unknown'}</TableCell>
                      <TableCell className="font-bold">{payment.amountPaid} RWF</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReceipt(payment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => releaseSlot(payment.recordId)}
                          >
                            Release Slot
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payments made yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorPayments;
