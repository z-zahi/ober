import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Detail } from '../../../components/Detail';
import { EmptyState } from '../../../components/EmptyState';
import { useRides } from '../../../context/rides-context';
import { paymentLabel } from '../../../features/account/payment-methods';
import { formatDateTime, formatPrice } from '../../../lib/format';

export default function RideBookedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRide } = useRides();
  const router = useRouter();
  const ride = getRide(String(id));

  if (!ride) {
    return (
      <View className="flex-1 bg-white p-6">
        <EmptyState title="Ride not found" message="This booking is no longer available." />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow p-6 pb-12">
      <View className="mb-6 mt-4 items-center">
        <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-ink">
          <Check color="#fff" size={36} strokeWidth={3} />
        </View>
        <Text className="mt-4 text-[28px] font-bold text-ink">Ride Scheduled!</Text>
        <Text className="mt-2 text-center text-muted">
          Your {ride.carType} is booked. It has been added to My Trips.
        </Text>
      </View>

      <View className="mb-6 rounded-card border border-line-soft p-4">
        <View className="flex-row justify-between">
          <Text className="text-lg font-bold text-ink">{ride.carType}</Text>
          <Text className="text-base font-bold text-ink">{formatPrice(ride.price)}</Text>
        </View>
        <Detail label="Pickup" value={ride.pickup} />
        <Detail label="Destination" value={ride.destination} />
        <Detail label="Pickup time" value={formatDateTime(ride.scheduledAt)} />
        <Detail label="Payment" value={paymentLabel(ride.paymentMethod)} />
      </View>

      <Button title="View My Trips" onPress={() => router.replace('/(tabs)/trips')} />
      <Button title="Back to Home" variant="outline" className="mt-3" onPress={() => router.replace('/(tabs)')} />
    </ScrollView>
  );
}
