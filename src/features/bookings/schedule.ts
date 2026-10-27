import type { Ride } from './types';

export const MAX_DAYS_AHEAD = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** The time the Choose Ride screen starts on: one hour from now. */
export function defaultScheduleTime(now: Date = new Date()): Date {
  return new Date(now.getTime() + 60 * 60 * 1000);
}

/** Returns an error message when the pickup time cannot be booked, or null when it can. */
export function validateSchedule(scheduledAt: Date, now: Date = new Date()): string | null {
  if (Number.isNaN(scheduledAt.getTime())) return 'Choose a date and time for your ride.';
  if (scheduledAt.getTime() <= now.getTime()) return 'Please choose a future date and time.';
  if (scheduledAt.getTime() > now.getTime() + MAX_DAYS_AHEAD * DAY_MS) {
    return `Rides can be scheduled up to ${MAX_DAYS_AHEAD} days ahead.`;
  }
  return null;
}

/** A scheduled ride can be cancelled until its pickup time. */
export function canCancel(ride: Ride, now: Date = new Date()): boolean {
  return ride.status === 'Scheduled' && new Date(ride.scheduledAt).getTime() > now.getTime();
}

/** Upcoming rides first (soonest at the top), then past and cancelled rides (newest at the top). */
export function splitTrips(rides: Ride[], now: Date = new Date()): { upcoming: Ride[]; past: Ride[] } {
  const time = (ride: Ride) => new Date(ride.scheduledAt).getTime();
  const upcoming = rides.filter((ride) => canCancel(ride, now)).sort((a, b) => time(a) - time(b));
  const past = rides.filter((ride) => !canCancel(ride, now)).sort((a, b) => time(b) - time(a));
  return { upcoming, past };
}
