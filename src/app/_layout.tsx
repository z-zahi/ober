import '../../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../context/auth-context';
import { PlacesProvider } from '../context/places-context';
import { RidesProvider } from '../context/rides-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RidesProvider>
        <PlacesProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { fontWeight: 'bold' },
              headerTintColor: '#000',
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: '#fff' },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="demo" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="ride/confirm" options={{ title: 'Choose Ride' }} />
            <Stack.Screen
              name="ride/booked/[id]"
              options={{ title: 'Ride Scheduled', headerBackVisible: false, gestureEnabled: false }}
            />
            <Stack.Screen name="trip/[id]" options={{ title: 'Trip Details' }} />
            <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="places" options={{ title: 'Saved Places' }} />
            <Stack.Screen name="payment" options={{ title: 'Payment Method' }} />
          </Stack>
        </PlacesProvider>
      </RidesProvider>
    </AuthProvider>
  );
}
