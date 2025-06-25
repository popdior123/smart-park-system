
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { ParkingSlot, Car, ParkingRecord, Payment } from '@/types/parking';
import { Car as CarIcon, Clock, CreditCard, LogOut, Users } from 'lucide-react';
import OperatorParkingGrid from '@/components/OperatorParkingGrid';
import OperatorCarManagement from '@/components/OperatorCarManagement';
import OperatorPayments from '@/components/OperatorPayments';

const OperatorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('parking');
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Initialize data
  useEffect(() => {
    // Load parking slots
    const storedSlots = localStorage.getItem('parking_slots');
    if (storedSlots) {
      setParkingSlots(JSON.parse(storedSlots));
    }

    // Load operator's cars
    const storedCars = localStorage.getItem('parking_cars');
    if (storedCars) {
      const allCars = JSON.parse(storedCars);
      setCars(allCars.filter((car: Car) => car.operatorId === user?.id));
    }

    // Load operator's parking records
    const storedRecords = localStorage.getItem('parking_records');
    if (storedRecords) {
      const allRecords = JSON.parse(storedRecords);
      setParkingRecords(allRecords.filter((record: ParkingRecord) => record.operatorId === user?.id));
    }

    // Load operator's payments
    const storedPayments = localStorage.getItem('parking_payments');
    if (storedPayments) {
      const allPayments = JSON.parse(storedPayments);
      setPayments(allPayments.filter((payment: Payment) => payment.operatorId === user?.id));
    }
  }, [user?.id]);

  const operatorStats = {
    myCars: cars.length,
    activeParkings: parkingRecords.filter(record => record.isActive).length,
    totalSpent: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
    unpaidBills: parkingRecords.filter(record => !record.isActive && !record.isPaid).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-600">SmartPark - Operator Portal</h1>
              <Badge variant="secondary" className="ml-3">
                Operator
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.fullName}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Cars</p>
                  <p className="text-2xl font-bold">{operatorStats.myCars}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Currently Parked</p>
                  <p className="text-2xl font-bold">{operatorStats.activeParkings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unpaid Bills</p>
                  <p className="text-2xl font-bold">{operatorStats.unpaidBills}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">{operatorStats.totalSpent} RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'parking', label: 'Available Slots' },
                { key: 'cars', label: 'My Cars' },
                { key: 'payments', label: 'Bills & Payments' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'parking' && (
              <OperatorParkingGrid 
                slots={parkingSlots}
                cars={cars}
                parkingRecords={parkingRecords}
                onRecordUpdate={setParkingRecords}
                operatorId={user?.id || ''}
              />
            )}
            {activeTab === 'cars' && (
              <OperatorCarManagement 
                cars={cars} 
                onCarsUpdate={setCars}
                operatorId={user?.id || ''}
              />
            )}
            {activeTab === 'payments' && (
              <OperatorPayments
                parkingRecords={parkingRecords}
                payments={payments}
                onPaymentUpdate={setPayments}
                onRecordUpdate={setParkingRecords}
                cars={cars}
                operatorId={user?.id || ''}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
