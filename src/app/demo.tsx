import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/auth-context';
import { useRides } from '../context/rides-context';
import { demoAccount } from '../features/demo-data';

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

/**
 * Presentation shortcut: `ober://demo?to=/trips` signs in the demo account and opens `to`.
 * Add `book=1` to schedule a sample ride first; `{id}` in `to` becomes that ride's id,
 * for example `ober://demo?book=1&to=/ride/booked/{id}`.
 * With Expo Go the link is `exp://<host>:8081/--/demo?to=/trips`.
 */
export default function DemoScreen() {
  const { to, book } = useLocalSearchParams<{ to?: string; book?: string }>();
  const { user, signIn } = useAuth();
  const { addRide } = useRides();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (!user) {
      signIn(demoAccount.user.email, demoAccount.password);
      return;
    }
    done.current = true;

    let target = to;
    if (book) {
      const scheduledAt = new Date(Date.now() + TWO_DAYS);
      scheduledAt.setHours(9, 30, 0, 0);
      const { ride } = addRide({
        pickup: 'Madinaty Gate 1',
        destination: 'The British University in Egypt, El Sherouk',
        carType: 'OberX',
        price: 120,
        paymentMethod: user.paymentMethod,
        scheduledAt: scheduledAt.toISOString(),
      });
      if (ride && target) target = target.replace('{id}', ride.id);
    }

    router.replace('/(tabs)');
    if (target && target !== '/') router.push(target as Href);
  }, [user, to, book, signIn, addRide]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#000" />
    </View>
  );
}
