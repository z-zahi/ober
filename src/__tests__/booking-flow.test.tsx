import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { demoAccount } from '../features/demo-data';

// The root layout imports the Tailwind stylesheet, which Metro compiles and Jest cannot parse.
jest.mock('../../global.css', () => ({}));
// Icons are decoration, and lucide ships ES modules that Jest does not load.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
// The native date picker only opens when the rider taps Date or Time; these flows keep the default time.
jest.mock('@react-native-community/datetimepicker', () => () => null);

let alert: jest.SpyInstance;

beforeEach(() => {
  alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  alert.mockRestore();
});

/** Opens the real app from src/app at `url`, starting signed out like a fresh launch. */
async function openApp(url = '/') {
  await renderRouter('./src/app', { initialUrl: url });
}

async function signIn(email: string, password: string) {
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), email);
  await fireEvent.changeText(screen.getByPlaceholderText('Your password'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Sign In' }));
}

/** Presses a button of the last dialog, as the rider would. */
async function pressAlertButton(text: string) {
  const buttons: { text: string; onPress?: () => void }[] = alert.mock.lastCall?.[2] ?? [];
  const button = buttons.find((item) => item.text === text);
  if (!button?.onPress) throw new Error(`The dialog has no "${text}" button`);
  await act(() => button.onPress!());
}

describe('signing in', () => {
  it('sends a signed-out rider to Sign In', async () => {
    await openApp('/trips');
    expect(screen).toHavePathname('/sign-in');
  });

  it('shows the error and stays on Sign In with a wrong password', async () => {
    await openApp();
    await signIn(demoAccount.user.email, 'wrong-password');
    expect(screen.getByRole('alert')).toHaveTextContent('Email or password is incorrect.');
    expect(screen).toHavePathname('/sign-in');
  });

  it('opens Home after signing in', async () => {
    await openApp();
    await signIn(demoAccount.user.email, demoAccount.password);
    expect(screen).toHavePathname('/');
    expect(screen.getByText('Where to?')).toBeOnTheScreen();
  });

  it('gives a new account an empty trip history', async () => {
    await openApp();
    await fireEvent.press(screen.getByRole('link', { name: 'Create an account' }));
    expect(screen).toHavePathname('/sign-up');

    await fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Daniella Amgad');
    await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'daniella@ober.app');
    await fireEvent.changeText(screen.getByPlaceholderText('+20 1001234567'), '01112223334');
    await fireEvent.changeText(screen.getByPlaceholderText('At least 6 characters'), 'secret1');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
    expect(screen).toHavePathname('/');

    await fireEvent.press(screen.getByLabelText(/^Trips, tab/));
    expect(screen.getByText('No trips yet!')).toBeOnTheScreen();
  });

  it('returns to Sign In after signing out', async () => {
    await openApp();
    await signIn(demoAccount.user.email, demoAccount.password);
    await fireEvent.press(screen.getByLabelText(/^Profile, tab/));
    await fireEvent.press(screen.getByRole('button', { name: 'Sign Out' }));
    expect(screen).toHavePathname('/sign-in');
  });
});

describe('booking a ride', () => {
  it('books, finds the ride in My Trips and cancels it', async () => {
    await openApp();
    await signIn(demoAccount.user.email, demoAccount.password);

    await fireEvent.changeText(screen.getByPlaceholderText('Enter pickup location'), '  Madinaty Gate 1 ');
    await fireEvent.changeText(screen.getByPlaceholderText('Where are you going?'), 'Smart Village');
    await fireEvent.press(screen.getByRole('button', { name: 'Choose a Ride' }));
    expect(screen).toHavePathname('/ride/confirm');
    expect(screen.getByText('Madinaty Gate 1')).toBeOnTheScreen();
    expect(screen.getByText('Smart Village')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: /OberXL/ }));
    await fireEvent.press(screen.getByRole('button', { name: 'Schedule Ride · EGP 200' }));
    expect(alert).not.toHaveBeenCalled();
    expect(screen.getByText('Ride Scheduled!')).toBeOnTheScreen();
    expect(screen.getByText('Your OberXL is booked. It has been added to My Trips.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'View My Trips' }));
    expect(screen).toHavePathname('/trips');
    await fireEvent.press(screen.getByText('Smart Village'));
    expect(screen).toHavePathname(expect.stringMatching(/^\/trip\//));
    expect(screen.getByText('Scheduled')).toBeOnTheScreen();
    expect(screen.getByText('EGP 200 (fixed price)')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel Ride' }));
    expect(alert).toHaveBeenCalledWith('Cancel this ride?', expect.any(String), expect.any(Array));
    await pressAlertButton('Cancel ride');
    expect(screen.getByText('Cancelled')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancel Ride' })).toBeNull();
  });

  it('asks for both addresses before choosing a ride', async () => {
    await openApp();
    await signIn(demoAccount.user.email, demoAccount.password);
    await fireEvent.changeText(screen.getByPlaceholderText('Where are you going?'), 'City Stars Mall');
    await fireEvent.press(screen.getByRole('button', { name: 'Choose a Ride' }));
    expect(alert).toHaveBeenCalledWith('Missing details', 'Please enter pickup and destination.');
    expect(screen).toHavePathname('/');
  });

  it('fills whichever address field was last focused from a saved place', async () => {
    await openApp();
    await signIn(demoAccount.user.email, demoAccount.password);

    await fireEvent.press(screen.getByRole('button', { name: 'University' }));
    await fireEvent(screen.getByPlaceholderText('Enter pickup location'), 'focus');
    await fireEvent.press(screen.getByRole('button', { name: 'Home' }));

    expect(screen.getByPlaceholderText('Enter pickup location')).toHaveDisplayValue('Madinaty Gate 1');
    expect(screen.getByPlaceholderText('Where are you going?')).toHaveDisplayValue(
      'The British University in Egypt, El Sherouk'
    );
  });

  it('shows a message for a trip that is not in the history', async () => {
    await openApp();
    await signIn(demoAccount.user.email, demoAccount.password);
    await testRouter.push('/trip/missing');
    expect(screen.getByText('Trip not found')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancel Ride' })).toBeNull();
  });
});
