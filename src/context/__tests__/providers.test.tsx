import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { SignUpInput } from '../../features/account/types';
import { splitTrips } from '../../features/bookings/schedule';
import type { NewRide } from '../../features/bookings/types';
import { demoAccount } from '../../features/demo-data';
import { AuthProvider, useAuth } from '../auth-context';
import { PlacesProvider, usePlaces } from '../places-context';
import { RidesProvider, useRides } from '../rides-context';

const HOUR = 60 * 60 * 1000;
const inHours = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();

const newRider: SignUpInput = {
  fullName: 'Daniella Amgad',
  email: 'daniella@ober.app',
  phone: '+20 1112223334',
  password: 'secret1',
};

const booking: NewRide = {
  pickup: 'Madinaty Gate 1',
  destination: 'Cairo International Airport, Terminal 3',
  carType: 'OberX',
  price: 120,
  paymentMethod: 'Cash',
  scheduledAt: inHours(2),
};

function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RidesProvider>
        <PlacesProvider>{children}</PlacesProvider>
      </RidesProvider>
    </AuthProvider>
  );
}

/** Renders the three providers like the root layout does and exposes all three hooks. */
async function renderApp() {
  const { result } = await renderHook(() => ({ auth: useAuth(), rides: useRides(), places: usePlaces() }), {
    wrapper: Providers,
  });
  const app = () => result.current;
  // Each action runs in its own act() so the next one sees the updated state, as it would after a tap.
  const run = <T,>(action: (current: ReturnType<typeof app>) => T) => act(() => action(app()));
  return { app, run };
}

async function signInDemo() {
  const session = await renderApp();
  expect(await session.run(({ auth }) => auth.signIn(demoAccount.user.email, demoAccount.password))).toBeNull();
  return session;
}

describe('AuthProvider', () => {
  it('starts signed out', async () => {
    const { app } = await renderApp();
    expect(app().auth.user).toBeNull();
  });

  it('signs in with the email in any case and with extra spaces', async () => {
    const { app, run } = await renderApp();
    expect(await run(({ auth }) => auth.signIn('  ALI@Ober.app ', demoAccount.password))).toBeNull();
    expect(app().auth.user?.id).toBe(demoAccount.user.id);
  });

  it('gives the same message for a wrong password and an unknown email', async () => {
    const { app, run } = await renderApp();
    expect(await run(({ auth }) => auth.signIn(demoAccount.user.email, 'wrong-password'))).toBe(
      'Email or password is incorrect.'
    );
    expect(await run(({ auth }) => auth.signIn('nobody@ober.app', demoAccount.password))).toBe(
      'Email or password is incorrect.'
    );
    expect(app().auth.user).toBeNull();
  });

  it('signs up, trims the details and starts with cash', async () => {
    const { app, run } = await renderApp();
    const error = await run(({ auth }) =>
      auth.signUp({ ...newRider, fullName: ' Daniella Amgad ', email: ' daniella@ober.app ' })
    );
    expect(error).toBeNull();
    expect(app().auth.user).toMatchObject({
      fullName: 'Daniella Amgad',
      email: 'daniella@ober.app',
      paymentMethod: 'Cash',
    });
  });

  it('lets a new account sign out and sign back in with its password', async () => {
    const { app, run } = await renderApp();
    await run(({ auth }) => auth.signUp(newRider));
    const id = app().auth.user?.id;
    await run(({ auth }) => auth.signOut());
    expect(app().auth.user).toBeNull();
    expect(await run(({ auth }) => auth.signIn(newRider.email, newRider.password))).toBeNull();
    expect(app().auth.user?.id).toBe(id);
  });

  it('refuses a second account with the same email in another case', async () => {
    const { app, run } = await renderApp();
    const error = await run(({ auth }) => auth.signUp({ ...newRider, email: 'ALI@OBER.APP' }));
    expect(error).toBe('An account with this email already exists.');
    expect(app().auth.user).toBeNull();
  });

  it('does not create an account when the form is invalid', async () => {
    const { run } = await renderApp();
    expect(await run(({ auth }) => auth.signUp({ ...newRider, password: '123' }))).toMatch(/6 characters/);
    expect(await run(({ auth }) => auth.signIn(newRider.email, '123'))).toBe('Email or password is incorrect.');
  });

  it('saves a trimmed profile and keeps the same email in another case', async () => {
    const { app, run } = await signInDemo();
    const error = await run(({ auth }) =>
      auth.updateProfile({ fullName: ' Ali Z ', email: 'ALI@ober.app', phone: ' 01001234567 ' })
    );
    expect(error).toBeNull();
    expect(app().auth.user).toMatchObject({ fullName: 'Ali Z', email: 'ALI@ober.app', phone: '01001234567' });
  });

  it("refuses to take another account's email and leaves the profile unchanged", async () => {
    const { app, run } = await renderApp();
    await run(({ auth }) => auth.signUp(newRider));
    const error = await run(({ auth }) =>
      auth.updateProfile({ fullName: newRider.fullName, email: demoAccount.user.email, phone: newRider.phone })
    );
    expect(error).toBe('Another account already uses this email.');
    expect(app().auth.user?.email).toBe(newRider.email);
  });

  it('keeps the old profile when the new details are invalid', async () => {
    const { app, run } = await signInDemo();
    const error = await run(({ auth }) => auth.updateProfile({ ...demoAccount.user, phone: '123' }));
    expect(error).toMatch(/phone number/);
    expect(app().auth.user?.phone).toBe(demoAccount.user.phone);
  });

  it('remembers the chosen payment method', async () => {
    const { app, run } = await signInDemo();
    await run(({ auth }) => auth.setPaymentMethod('Wallet'));
    expect(app().auth.user?.paymentMethod).toBe('Wallet');
  });

  it('throws a clear error outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useAuth())).rejects.toThrow('useAuth must be used inside AuthProvider');
  });
});

describe('RidesProvider', () => {
  it('needs a signed-in rider to book', async () => {
    const { run } = await renderApp();
    expect(await run(({ rides }) => rides.addRide(booking))).toEqual({ error: 'Sign in to book a ride.' });
  });

  it('books a scheduled ride for the signed-in rider and lists it first', async () => {
    const { app, run } = await signInDemo();
    const { ride, error } = await run(({ rides }) => rides.addRide(booking));
    expect(error).toBeUndefined();
    expect(ride).toMatchObject({ ...booking, riderId: demoAccount.user.id, status: 'Scheduled' });
    expect(app().rides.rides[0].id).toBe(ride!.id);
    expect(app().rides.getRide(ride!.id)).toEqual(ride);
    expect(splitTrips(app().rides.rides).upcoming.map((item) => item.id)).toEqual([ride!.id]);
  });

  it.each([
    ['a past time', { scheduledAt: inHours(-1) }, 'Please choose a future date and time.'],
    ['a time beyond 30 days', { scheduledAt: inHours(31 * 24) }, 'Rides can be scheduled up to 30 days ahead.'],
    ['an invalid time', { scheduledAt: 'not a date' }, 'Choose a date and time for your ride.'],
    ['a blank pickup', { pickup: '   ' }, 'Please enter pickup and destination.'],
    ['a blank destination', { destination: '' }, 'Please enter pickup and destination.'],
  ])('refuses %s and books nothing', async (_case, change, message) => {
    const { app, run } = await signInDemo();
    const before = app().rides.rides.length;
    expect(await run(({ rides }) => rides.addRide({ ...booking, ...change }))).toEqual({ error: message });
    expect(app().rides.rides).toHaveLength(before);
  });

  it('keeps a cancelled ride in history and moves it to past trips', async () => {
    const { app, run } = await signInDemo();
    const { ride } = await run(({ rides }) => rides.addRide(booking));
    expect(await run(({ rides }) => rides.cancelRide(ride!.id))).toBeNull();

    expect(app().rides.getRide(ride!.id)).toEqual({ ...ride, status: 'Cancelled' });
    const { upcoming, past } = splitTrips(app().rides.rides);
    expect(upcoming).toEqual([]);
    expect(past.map((item) => item.id)).toContain(ride!.id);
  });

  it('cancels only the chosen ride', async () => {
    const { app, run } = await signInDemo();
    const first = (await run(({ rides }) => rides.addRide(booking))).ride!;
    const second = (await run(({ rides }) => rides.addRide({ ...booking, scheduledAt: inHours(5) }))).ride!;
    await run(({ rides }) => rides.cancelRide(first.id));
    expect(app().rides.getRide(second.id)?.status).toBe('Scheduled');
  });

  it('refuses to cancel twice, a completed ride or an unknown ride', async () => {
    const { app, run } = await signInDemo();
    const { ride } = await run(({ rides }) => rides.addRide(booking));
    await run(({ rides }) => rides.cancelRide(ride!.id));

    const refused = 'This ride can no longer be cancelled.';
    expect(await run(({ rides }) => rides.cancelRide(ride!.id))).toBe(refused);
    expect(await run(({ rides }) => rides.cancelRide('r3'))).toBe(refused);
    expect(await run(({ rides }) => rides.cancelRide('missing'))).toBe(refused);
    expect(app().rides.getRide(ride!.id)?.status).toBe('Cancelled');
    expect(app().rides.getRide('r3')?.status).toBe('Completed');
  });

  it('keeps the payment method a ride was booked with after the preference changes', async () => {
    const { app, run } = await signInDemo();
    const { ride } = await run(({ rides }) => rides.addRide({ ...booking, paymentMethod: 'Card' }));
    await run(({ auth }) => auth.setPaymentMethod('Wallet'));
    expect(app().rides.getRide(ride!.id)?.paymentMethod).toBe('Card');
  });
});

describe('PlacesProvider', () => {
  it('needs a signed-in rider to save a place', async () => {
    const { run } = await renderApp();
    expect(await run(({ places }) => places.addPlace('Gym', 'Golds Gym'))).toBe('Sign in to save places.');
  });

  it('saves a trimmed place and removes it again', async () => {
    const { app, run } = await signInDemo();
    expect(await run(({ places }) => places.addPlace('  Gym ', ' Golds Gym, Madinaty '))).toBeNull();
    const gym = app().places.places.find((place) => place.label === 'Gym');
    expect(gym).toMatchObject({ address: 'Golds Gym, Madinaty', userId: demoAccount.user.id });

    await run(({ places }) => places.removePlace(gym!.id));
    expect(app().places.places.map((place) => place.label)).toEqual(['Home', 'University']);
  });

  it('refuses a second place with the same name', async () => {
    const { app, run } = await signInDemo();
    expect(await run(({ places }) => places.addPlace('HOME', 'Somewhere else'))).toBe(
      'You already have a place called HOME.'
    );
    expect(app().places.places).toHaveLength(2);
  });
});

describe('separate accounts', () => {
  it("never shows the demo rider's trips or places to a new account", async () => {
    const { app, run } = await signInDemo();
    expect(app().rides.rides).toHaveLength(3);
    expect(app().places.places).toHaveLength(2);

    await run(({ auth }) => auth.signOut());
    expect(app().rides.rides).toEqual([]);
    expect(app().places.places).toEqual([]);

    await run(({ auth }) => auth.signUp(newRider));
    expect(app().rides.rides).toEqual([]);
    expect(app().places.places).toEqual([]);
    expect(app().rides.getRide('r1')).toBeUndefined();
  });

  it("does not let a new account cancel the demo rider's ride", async () => {
    const { app, run } = await signInDemo();
    const { ride } = await run(({ rides }) => rides.addRide(booking));
    await run(({ auth }) => auth.signOut());
    await run(({ auth }) => auth.signUp(newRider));

    expect(await run(({ rides }) => rides.cancelRide(ride!.id))).toBe('This ride can no longer be cancelled.');

    await run(({ auth }) => auth.signOut());
    await run(({ auth }) => auth.signIn(demoAccount.user.email, demoAccount.password));
    expect(app().rides.getRide(ride!.id)?.status).toBe('Scheduled');
  });

  it("keeps each account's own records after switching back and forth", async () => {
    const { app, run } = await renderApp();
    await run(({ auth }) => auth.signUp(newRider));
    const { ride } = await run(({ rides }) => rides.addRide(booking));
    expect(await run(({ places }) => places.addPlace('Home', 'Rehab City'))).toBeNull();

    await run(({ auth }) => auth.signOut());
    await run(({ auth }) => auth.signIn(demoAccount.user.email, demoAccount.password));
    expect(app().rides.rides.map((item) => item.id)).not.toContain(ride!.id);
    expect(app().places.places.find((place) => place.label === 'Home')?.address).toBe('Madinaty Gate 1');

    await run(({ auth }) => auth.signOut());
    await run(({ auth }) => auth.signIn(newRider.email, newRider.password));
    expect(app().rides.rides.map((item) => item.id)).toEqual([ride!.id]);
    expect(app().places.places.map((place) => place.address)).toEqual(['Rehab City']);
  });
});
