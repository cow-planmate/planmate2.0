import React from 'react';
import { DestinationSelector } from '../molecules/DestinationSelector';
import { DurationInput } from '../molecules/DurationInput';

interface TravelDetailsSectionProps {
  destination: string;
  setDestination: (val: string) => void;
  showDestinationSelector: boolean;
  setShowDestinationSelector: (val: boolean) => void;
  travelCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  availableTravels: any[];
  days: number;
  nights: number;
  setDays: (val: number) => void;
  setNights: (val: number) => void;
  setDuration: (val: string) => void;
}

export const TravelDetailsSection: React.FC<TravelDetailsSectionProps> = (props) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        <DestinationSelector
          destination={props.destination}
          setDestination={props.setDestination}
          showDestinationSelector={props.showDestinationSelector}
          setShowDestinationSelector={props.setShowDestinationSelector}
          travelCategories={props.travelCategories}
          selectedCategory={props.selectedCategory}
          setSelectedCategory={props.setSelectedCategory}
          availableTravels={props.availableTravels}
        />
        <DurationInput
          days={props.days}
          nights={props.nights}
          setDays={props.setDays}
          setNights={props.setNights}
          setDuration={props.setDuration}
        />
      </div>
    </div>
  );
};
