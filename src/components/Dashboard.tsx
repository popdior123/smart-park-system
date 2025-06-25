
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { ParkingSlot, Car, ParkingRecord, Payment, User } from '@/types/parking';
import { Car as CarIcon, Clock, CreditCard, LogOut, Users } from 'lucide-react';
import AdminParkingSlots from '@/components/AdminParkingSlots';
import AdminOperators from '@/components/AdminOperators';
import AdminPayments from '@/components/AdminPayments';
import DailyReports from '@/components/DailyReports';

const Dashboard: React.FC = () => {
  const { user, logout, getAllOperators } = useAuth();
  const [activeTab, setActiveTab] = useState('parking');
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [operators, setOperators] = useState<User[]>([]);

  // Initialize mock data
  useEffect(() => {
    // Initialize parking slots (empty by default)
    const storedSlots = localStorage.getItem('parking_slots');
    if (storedSlots) {
      setParkingSlots(JSON.parse(storedSlots));
    } else {
      const mockSlots: ParkingSlot[] = Array.from({ length: 20 }, (_, i) => ({
        id: `slot-${i + 1}`,
        slotNumber: `A${String(i + 1).padStart(2, '0')}`,
        slotStatus: 'available', // All slots start as available
        location: `Zone A, Level 1`
      }));
      setParkingSlots(mockSlots);
      localStorage.setItem('parking_slots', JSON.stringify(mockSlots));
    }

    // Load all data for admin view
    const storedCars = localStorage.getItem('parking_cars');
    if (storedCars) setCars(JSON.parse(storedCars));

    const storedRecords = localStorage.getItem('parking_records');
    if (storedRecords) setParkingRecords(JSON.parse(storedRecords));

    const storedPayments = localStorage.getItem('parking_payments');
    if (storedPayments) setPayments(JSON.parse(storedPayments));

    // Load operators
    setOperators(getAllOperators());
  }, [getAllOperators]);

  const stats = {
    totalSlots: parkingSlots.length,
    occupiedSlots: parkingSlots.filter(slot => slot.slotStatus === 'occupied').length,
    availableSlots: parkingSlots.filter(slot => slot.slotStatus === 'available').length,
    totalRevenue: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
    totalOperators: operators.length,
    activeOperators: operators.filter(op => 
      parkingRecords.some(record => record.operatorId === op.id && record.isActive)
    ).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-600">SmartPark Admin Dashboard</h1>
              <Badge variant="secondary" className="ml-3">
                Administrator
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Slots</p>
                  <p className="text-2xl font-bold">{stats.totalSlots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CarIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold">{stats.occupiedSlots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold">{stats.availableSlots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue} RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Operators</p>
                  <p className="text-2xl font-bold">{stats.totalOperators}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Operators</p>
                  <p className="text-2xl font-bold">{stats.activeOperators}</p>
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
                { key: 'parking', label: 'Parking Slots' },
                { key: 'operators', label: 'Operators' },
                { key: 'payments', label: 'Payment History' },
                { key: 'reports', label: 'Reports' }
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
              <AdminParkingSlots 
                slots={parkingSlots} 
                onSlotUpdate={setParkingSlots}
              />
            )}
            {activeTab === 'operators' && (
              <AdminOperators 
                operators={operators}
                cars={cars}
                parkingRecords={parkingRecords}
              />
            )}
            {activeTab === 'payments' && (
              <AdminPayments
                payments={payments}
                parkingRecords={parkingRecords}
                cars={cars}
                operators={operators}
              />
            )}
            {activeTab === 'reports' && (
              <DailyReports payments={payments} parkingRecords={parkingRecords} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
