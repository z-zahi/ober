import { cheapestOption, rideOptions } from '../ride-options';
import { MAX_DAYS_AHEAD, canCancel, defaultScheduleTime, splitTrips, validateSchedule } from '../schedule';
import type { Ride } from '../types';

const now = new Date('2026-10-27T12:00:00Z');
const minutes = (n: number) => new Date(now.getTime() + n * 60 * 1000);

function ride(overrides: Partial<Ride>): Ride {
  return {
    id: 'r',
    riderId: 'u1',
    pickup: 'A',
    destination: 'B',
    carType: 'OberX',
    price: 120,
    paymentMethod: 'Cash',
    bookedAt: now.toISOString(),
    scheduledAt: minutes(60).toISOString(),
    status: 'Scheduled',
    ...overrides,
  };
}

describe('validateSchedule', () => {
  it('accepts a future time', () => {
    expect(validateSchedule(minutes(5), now)).toBeNull();
  });

  it('rejects a time in the past', () => {
    expect(validateSchedule(minutes(-1), now)).toBe('Please choose a future date and time.');
  });

  it('rejects the current minute', () => {
    expect(validateSchedule(now, now)).not.toBeNull();
  });

  it('rejects a time more than 30 days ahead', () => {
    expect(validateSchedule(minutes(MAX_DAYS_AHEAD * 24 * 60 + 1), now)).toMatch(/30 days/);
  });

  it('accepts exactly 30 days ahead', () => {
    expect(validateSchedule(minutes(MAX_DAYS_AHEAD * 24 * 60), now)).toBeNull();
  });

  it('rejects an invalid date', () => {
    expect(validateSchedule(new Date('not a date'), now)).not.toBeNull();
  });

  it('starts the picker one hour ahead, which is valid', () => {
    expect(defaultScheduleTime(now).getTime() - now.getTime()).toBe(60 * 60 * 1000);
    expect(validateSchedule(defaultScheduleTime(now), now)).toBeNull();
  });
});

describe('canCancel', () => {
  it('allows cancelling a scheduled ride before pickup', () => {
    expect(canCancel(ride({}), now)).toBe(true);
  });

  it('blocks cancelling after the pickup time', () => {
    expect(canCancel(ride({ scheduledAt: minutes(-10).toISOString() }), now)).toBe(false);
  });

  it('blocks cancelling at the exact pickup time', () => {
    expect(canCancel(ride({ scheduledAt: now.toISOString() }), now)).toBe(false);
  });

  it('blocks cancelling completed or cancelled rides', () => {
    expect(canCancel(ride({ status: 'Completed' }), now)).toBe(false);
    expect(canCancel(ride({ status: 'Cancelled' }), now)).toBe(false);
  });
});

describe('splitTrips', () => {
  it('puts upcoming rides soonest first and past rides newest first', () => {
    const rides = [
      ride({ id: 'later', scheduledAt: minutes(120).toISOString() }),
      ride({ id: 'old', status: 'Completed', scheduledAt: minutes(-600).toISOString() }),
      ride({ id: 'soon', scheduledAt: minutes(30).toISOString() }),
      ride({ id: 'recent', status: 'Cancelled', scheduledAt: minutes(-60).toISOString() }),
    ];
    const { upcoming, past } = splitTrips(rides, now);
    expect(upcoming.map((r) => r.id)).toEqual(['soon', 'later']);
    expect(past.map((r) => r.id)).toEqual(['recent', 'old']);
  });

  it('puts a cancelled ride under past even when its pickup is in the future', () => {
    const { upcoming, past } = splitTrips([ride({ id: 'cancelled', status: 'Cancelled' })], now);
    expect(upcoming).toEqual([]);
    expect(past.map((r) => r.id)).toEqual(['cancelled']);
  });

  it('moves a scheduled ride to past once its pickup passes, without marking it completed', () => {
    const { upcoming, past } = splitTrips([ride({ id: 'missed', scheduledAt: minutes(-5).toISOString() })], now);
    expect(upcoming).toEqual([]);
    expect(past[0]).toMatchObject({ id: 'missed', status: 'Scheduled' });
  });

  it('leaves the original list in its order', () => {
    const rides = [ride({ id: 'later', scheduledAt: minutes(120).toISOString() }), ride({ id: 'soon' })];
    splitTrips(rides, now);
    expect(rides.map((r) => r.id)).toEqual(['later', 'soon']);
  });
});

describe('ride options', () => {
  it('offers at least two rides with different fares', () => {
    expect(new Set(rideOptions.map((option) => option.price)).size).toBeGreaterThanOrEqual(2);
  });

  it('finds the cheapest option', () => {
    expect(cheapestOption().name).toBe('OberX');
  });

  it('finds the cheapest option in any order and keeps the first on a tie', () => {
    const options = [
      { name: 'Big', description: '', seats: 6, price: 300 },
      { name: 'Small', description: '', seats: 4, price: 90 },
      { name: 'Other', description: '', seats: 4, price: 90 },
    ];
    expect(cheapestOption(options).name).toBe('Small');
  });
});
