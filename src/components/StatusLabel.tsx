import { Text } from 'react-native';

import type { RideStatus } from '../features/bookings/types';

const colorClass: Record<RideStatus, string> = {
  Scheduled: 'text-success',
  Completed: 'text-subtle',
  Cancelled: 'text-danger',
};

export function StatusLabel({ status }: { status: RideStatus }) {
  return <Text className={`font-semibold ${colorClass[status]}`}>{status}</Text>;
}
