import { useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Detail } from '../../components/Detail';
import { EmptyState } from '../../components/EmptyState';
import { StatusLabel } from '../../components/StatusLabel';
import { useRides } from '../../context/rides-context';
import { paymentLabel } from '../../features/account/payment-methods';
import { canCancel } from '../../features/bookings/schedule';
import { formatDateTime, formatPrice } from '../../lib/format';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRide, cancelRide } = useRides();
  const ride = getRide(String(id));

  if (!ride) {
    return (
      <View className="flex-1 bg-white p-6">
        <EmptyState title="Trip not found" message="This trip is not in your history." />
      </View>
    );
  }

  function confirmCancel() {
    Alert.alert('Cancel this ride?', 'It will move to your previous trips as cancelled.', [
      { text: 'Keep ride', style: 'cancel' },
      {
        text: 'Cancel ride',
        style: 'destructive',
        onPress: () => {
          const error = cancelRide(String(id));
          if (error) Alert.alert('Could not cancel', error);
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow p-6 pb-12">
      <View className="mb-6 flex-row items-end justify-between">
        <View>
          <Text className="text-[28px] font-bold text-ink">{ride.carType}</Text>
          <StatusLabel status={ride.status} />
        </View>
        <Text className="text-2xl font-bold text-ink">{formatPrice(ride.price)}</Text>
      </View>

      <View className="mb-4 rounded-card bg-surface p-4">
        <Text className="mb-1 text-[13px] text-muted">From</Text>
        <Text className="mb-4 text-base font-semibold text-ink">{ride.pickup}</Text>
        <Text className="mb-1 text-[13px] text-muted">To</Text>
        <Text className="text-base font-semibold text-ink">{ride.destination}</Text>
      </View>

      <View className="mb-6 rounded-card border border-line-soft p-4">
        <Text className="text-lg font-bold text-ink">Trip information</Text>
        <View className="mt-4 h-px bg-line-soft" />
        <Detail label="Scheduled Date & Time" value={formatDateTime(ride.scheduledAt)} />
        <Detail label="Booked on" value={formatDateTime(ride.bookedAt)} />
        <Detail label="Payment" value={paymentLabel(ride.paymentMethod)} />
        <Detail label="Fare" value={`${formatPrice(ride.price)} (fixed price)`} />
        <Detail label="Booking reference" value={ride.id.toUpperCase()} />
      </View>

      {canCancel(ride) ? (
        <>
          <Button title="Cancel Ride" variant="danger" onPress={confirmCancel} />
          <Text className="mt-3 text-center text-xs text-subtle">
            You can cancel a scheduled ride until its pickup time.
          </Text>
        </>
      ) : null}
    </ScrollView>
  );
}
