import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { Ride } from '../features/bookings/types';
import { formatDateTime, formatPrice } from '../lib/format';
import { Detail } from './Detail';
import { StatusLabel } from './StatusLabel';

export function TripCard({ ride }: { ride: Ride }) {
  return (
    <Link href={{ pathname: '/trip/[id]', params: { id: ride.id } }} asChild>
      <Pressable className="mb-4 rounded-card border border-line-soft p-4 active:bg-surface">
        <View className="mb-1 flex-row justify-between">
          <Text className="text-lg font-bold text-ink">{ride.carType}</Text>
          <Text className="text-base font-bold text-ink">{formatPrice(ride.price)}</Text>
        </View>
        <Detail label="Pickup" value={ride.pickup} />
        <Detail label="Destination" value={ride.destination} />
        <Detail label="Scheduled Date & Time" value={formatDateTime(ride.scheduledAt)} />
        <View className="mt-3 flex-row items-center justify-between">
          <StatusLabel status={ride.status} />
          <Text className="text-[13px] text-subtle">View details ›</Text>
        </View>
      </Pressable>
    </Link>
  );
}
