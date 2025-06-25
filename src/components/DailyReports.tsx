
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Payment, ParkingRecord } from '@/types/parking';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp } from 'lucide-react';

interface DailyReportsProps {
  payments: Payment[];
  parkingRecords: ParkingRecord[];
}

const DailyReports: React.FC<DailyReportsProps> = ({ payments, parkingRecords }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyStats = useMemo(() => {
    const selectedDateObj = new Date(selectedDate);
    const dayPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.toDateString() === selectedDateObj.toDateString();
    });

    const dayRecords = parkingRecords.filter(record => {
      const entryDate = new Date(record.entryTime);
      return entryDate.toDateString() === selectedDateObj.toDateString();
    });

    return {
      totalRevenue: dayPayments.reduce((sum, payment) => sum + payment.amountPaid, 0),
      totalTransactions: dayPayments.length,
      totalParkingActivities: dayRecords.length,
      averageParking: dayRecords.length > 0 
        ? Math.round(dayRecords.reduce((sum, record) => sum + (record.duration || 0), 0) / dayRecords.length * 100) / 100
        : 0,
      paymentMethods: dayPayments.reduce((acc, payment) => {
        acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [payments, parkingRecords, selectedDate]);

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    return last7Days.map(date => {
      const dayPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.toDateString() === date.toDateString();
      });

      const dayRecords = parkingRecords.filter(record => {
        const entryDate = new Date(record.entryTime);
        return entryDate.toDateString() === date.toDateString();
      });

      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayPayments.reduce((sum, payment) => sum + payment.amountPaid, 0),
        transactions: dayPayments.length,
        parkingCount: dayRecords.length
      };
    });
  }, [payments, parkingRecords]);

  const exportReport = () => {
    const reportData = {
      date: selectedDate,
      stats: dailyStats,
      payments: payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const selectedDateObj = new Date(selectedDate);
        return paymentDate.toDateString() === selectedDateObj.toDateString();
      })
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-report-${selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Daily Reports
        </CardTitle>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Daily Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{dailyStats.totalRevenue} RWF</div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{dailyStats.totalTransactions}</div>
              <p className="text-sm text-gray-600">Transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{dailyStats.totalParkingActivities}</div>
              <p className="text-sm text-gray-600">Parking Activities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{dailyStats.averageParking}h</div>
              <p className="text-sm text-gray-600">Avg. Parking Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Revenue Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} RWF`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Methods ({selectedDate})</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(dailyStats.paymentMethods).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(dailyStats.paymentMethods).map(([method, count]) => (
                    <TableRow key={method}>
                      <TableCell className="capitalize">{method}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        {Math.round((count / dailyStats.totalTransactions) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payment data for selected date.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(-5).reverse().map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.paymentDate.toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-bold">{payment.amountPaid} RWF</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell className="capitalize">{payment.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions to display.
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </div>
  );
};

export default DailyReports;
