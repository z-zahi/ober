import { createContext, useContext, useState, type ReactNode } from 'react';

import { canCancel, validateSchedule } from '../features/bookings/schedule';
import type { NewRide, Ride } from '../features/bookings/types';
import { demoRides } from '../features/demo-data';
import { newId } from '../lib/format';
import { useAuth } from './auth-context';

type BookResult = { ride: Ride; error?: undefined } | { ride?: undefined; error: string };

type RidesContextType = {
  /** Rides of the signed-in user. */
  rides: Ride[];
  addRide: (ride: NewRide) => BookResult;
  cancelRide: (id: string) => string | null;
  getRide: (id: string) => Ride | undefined;
};

const RidesContext = createContext<RidesContextType | undefined>(undefined);

export function RidesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allRides, setAllRides] = useState<Ride[]>(demoRides);

  const rides = allRides.filter((ride) => ride.riderId === user?.id);

  const addRide = (input: NewRide): BookResult => {
    if (!user) return { error: 'Sign in to book a ride.' };
    if (!input.pickup.trim() || !input.destination.trim()) {
      return { error: 'Please enter pickup and destination.' };
    }
    const error = validateSchedule(new Date(input.scheduledAt));
    if (error) return { error };

    const ride: Ride = {
      ...input,
      id: newId(),
      riderId: user.id,
      bookedAt: new Date().toISOString(),
      status: 'Scheduled',
    };
    setAllRides((currentRides) => [ride, ...currentRides]);
    return { ride };
  };

  const cancelRide = (id: string) => {
    const ride = rides.find((item) => item.id === id);
    if (!ride || !canCancel(ride)) return 'This ride can no longer be cancelled.';
    setAllRides((currentRides) =>
      currentRides.map((item) => (item.id === id ? { ...item, status: 'Cancelled' } : item))
    );
    return null;
  };

  return (
    <RidesContext.Provider
      value={{ rides, addRide, cancelRide, getRide: (id) => rides.find((ride) => ride.id === id) }}>
      {children}
    </RidesContext.Provider>
  );
}

export function useRides() {
  const context = useContext(RidesContext);

  if (!context) {
    throw new Error('useRides must be used inside RidesProvider');
  }

  return context;
}
