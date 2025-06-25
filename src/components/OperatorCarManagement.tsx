
import React from 'react';
import CarRegistration from '@/components/CarRegistration';
import { Car } from '@/types/parking';

interface OperatorCarManagementProps {
  cars: Car[];
  onCarsUpdate: (cars: Car[]) => void;
  operatorId: string;
}

const OperatorCarManagement: React.FC<OperatorCarManagementProps> = ({
  cars,
  onCarsUpdate,
  operatorId
}) => {
  return (
    <CarRegistration 
      cars={cars} 
      onCarsUpdate={onCarsUpdate}
      operatorId={operatorId}
    />
  );
};

export default OperatorCarManagement;
