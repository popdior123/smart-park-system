
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

  // Get active parking records (cars currently parked)
  const activeRecords = parkingRecords.filter(record => record.isActive);
  
  // Get unpaid records (cars that were parked but haven't paid yet)
  const unpaidRecords = parkingRecords.filter(record => 
    !record.isActive && record.duration && !record.isPaid
  );

  const calculateDurationAndAmount = (record: ParkingRecord) => {
    const now = new Date();
    const entryTime = new Date(record.entryTime);
    const durationHours = Math.ceil((now.getTime() - entryTime.getTime()) / (1000 * 60 * 60));
    const amount = durationHours * HOURLY_RATE;
    return { durationHours, amount };
  };

  const payAndRelease = () => {
    if (!selectedRecord) return;

    const { durationHours, amount } = calculateDurationAndAmount(selectedRecord);
    
    const exitTime = new Date();
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      recordId: selectedRecord.id,
      operatorId,
      amountPaid: amount,
      paymentDate: exitTime,
      paymentMethod,
      status: 'completed'
    };

    // Update the parking record
    const updatedRecords = parkingRecords.map(record =>
      record.id === selectedRecord.id
        ? { 
            ...record, 
            exitTime, 
            duration: durationHours, 
            isActive: false, 
            isPaid: true 
          }
        : record
    );

    // Release the slot
    const allSlots = JSON.parse(localStorage.getItem('parking_slots') || '[]');
    const updatedSlots = allSlots.map((slot: any) =>
      slot.id === selectedRecord.slotId
        ? { ...slot, slotStatus: 'available' }
        : slot
    );
    localStorage.setItem('parking_slots', JSON.stringify(updatedSlots));

    const updatedPayments = [...payments, newPayment];
    
    onPaymentUpdate(updatedPayments);
    onRecordUpdate(updatedRecords);
    
    // Update localStorage
    localStorage.setItem('parking_payments', JSON.stringify([...JSON.parse(localStorage.getItem('parking_payments') || '[]'), newPayment]));
    localStorage.setItem('parking_records', JSON.stringify(updatedRecords));
    
    setSelectedRecord(null);

    toast({
      title: 'Payment Processed & Slot Released',
      description: `Payment of ${amount} RWF processed successfully. Slot has been released.`,
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
      {/* Currently Parked Cars - Pay to Release */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Currently Parked - Pay to Release
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount to Pay</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRecords.map((record) => {
                  const car = getCarForRecord(record);
                  const { durationHours, amount } = calculateDurationAndAmount(record);
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {car?.plateNumber || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {new Date(record.entryTime).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatDuration(durationHours)}</TableCell>
                      <TableCell className="font-bold">{amount} RWF</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              Pay to Release
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Pay and Release Slot</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold">Payment Details</h4>
                                <p>Car: {car?.plateNumber}</p>
                                <p>Duration: {formatDuration(durationHours)}</p>
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
                              <Button onClick={payAndRelease} className="w-full">
                                <Receipt className="h-4 w-4 mr-2" />
                                Pay {amount} RWF & Release Slot
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
              No cars currently parked.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
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
                  <TableHead>Duration</TableHead>
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
                      <TableCell>
                        {record?.duration ? formatDuration(record.duration) : 'Unknown'}
                      </TableCell>
                      <TableCell className="font-bold">{payment.amountPaid} RWF</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReceipt(payment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
