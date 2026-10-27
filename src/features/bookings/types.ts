import type { PaymentMethod } from '../account/types';

export type RideStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export type Ride = {
  id: string;
  riderId: string;
  pickup: string;
  destination: string;
  carType: string;
  price: number;
  paymentMethod: PaymentMethod;
  /** ISO time the ride was booked. */
  bookedAt: string;
  /** ISO time the rider wants to be picked up. */
  scheduledAt: string;
  status: RideStatus;
};

export type RideOption = {
  name: string;
  description: string;
  seats: number;
  price: number;
};

export type NewRide = Pick<Ride, 'pickup' | 'destination' | 'carType' | 'price' | 'paymentMethod' | 'scheduledAt'>;
