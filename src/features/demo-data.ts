import type { SavedPlace, User } from './account/types';
import type { Ride } from './bookings/types';

/**
 * Phase 1 has no backend, so the providers start from this in-memory data.
 * It resets every time the app reloads.
 */
export const demoAccount: { user: User; password: string } = {
  user: {
    id: 'u1',
    fullName: 'Ali Zahi',
    email: 'ali@ober.app',
    phone: '+20 1001234567',
    paymentMethod: 'Cash',
  },
  password: 'ober123',
};

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number, hour: number): string {
  const date = new Date(Date.now() - days * DAY);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function demoRides(): Ride[] {
  return [
    {
      id: 'r3',
      riderId: 'u1',
      pickup: 'The British University in Egypt, El Sherouk',
      destination: 'City Stars Mall, Nasr City',
      carType: 'OberX',
      price: 120,
      paymentMethod: 'Cash',
      bookedAt: daysAgo(4, 9),
      scheduledAt: daysAgo(3, 17),
      status: 'Completed',
    },
    {
      id: 'r2',
      riderId: 'u1',
      pickup: 'Madinaty Gate 1',
      destination: 'Cairo International Airport, Terminal 3',
      carType: 'OberXL',
      price: 200,
      paymentMethod: 'Card',
      bookedAt: daysAgo(6, 20),
      scheduledAt: daysAgo(5, 6),
      status: 'Cancelled',
    },
    {
      id: 'r1',
      riderId: 'u1',
      pickup: 'Cairo Festival City Mall',
      destination: 'The British University in Egypt, El Sherouk',
      carType: 'OberX',
      price: 120,
      paymentMethod: 'Wallet',
      bookedAt: daysAgo(10, 8),
      scheduledAt: daysAgo(9, 8),
      status: 'Completed',
    },
  ];
}

export const demoPlaces: SavedPlace[] = [
  { id: 'p1', userId: 'u1', label: 'Home', address: 'Madinaty Gate 1' },
  { id: 'p2', userId: 'u1', label: 'University', address: 'The British University in Egypt, El Sherouk' },
];
