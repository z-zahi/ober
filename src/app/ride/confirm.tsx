import DateTimePicker from '@react-native-community/datetimepicker';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { OptionCard } from '../../components/OptionCard';
import { SectionTitle } from '../../components/PageTitle';
import { useAuth } from '../../context/auth-context';
import { useRides } from '../../context/rides-context';
import { paymentLabel } from '../../features/account/payment-methods';
import { cheapestOption, rideOptions } from '../../features/bookings/ride-options';
import { defaultScheduleTime, validateSchedule } from '../../features/bookings/schedule';
import { formatDate, formatPrice, formatTime } from '../../lib/format';

export default function ChooseRideScreen() {
  const { pickup, destination } = useLocalSearchParams<{
    pickup: string;
    destination: string;
  }>();

  const [selected, setSelected] = useState('OberX');
  const [scheduledAt, setScheduledAt] = useState(() => defaultScheduleTime());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const { user } = useAuth();
  const { addRide } = useRides();
  const router = useRouter();

  const selectedRide = rideOptions.find((ride) => ride.name === selected)!;
  const cheapest = cheapestOption();
  const paymentMethod = user?.paymentMethod ?? 'Cash';

  function openPicker(mode: 'date' | 'time') {
    setPickerMode(mode);
    setShowPicker(true);
  }

  function onDateTimeChange(value?: Date) {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }

    if (value) {
      setScheduledAt(value);
    }
  }

  function confirmRide() {
    const scheduleError = validateSchedule(scheduledAt);
    if (scheduleError) {
      Alert.alert('Invalid time', scheduleError);
      return;
    }

    const result = addRide({
      pickup: String(pickup ?? ''),
      destination: String(destination ?? ''),
      carType: selectedRide.name,
      price: selectedRide.price,
      paymentMethod,
      scheduledAt: scheduledAt.toISOString(),
    });

    if (!result.ride) {
      Alert.alert('Could not schedule ride', result.error);
      return;
    }

    router.replace({ pathname: '/ride/booked/[id]', params: { id: result.ride.id } });
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow p-6 pb-12">
      <Text className="mb-6 text-[28px] font-bold text-ink">Choose your ride</Text>

      <View className="mb-6 rounded-card bg-surface p-4">
        <Text className="mb-1 text-[13px] text-muted">From</Text>
        <Text className="mb-4 text-base font-semibold text-ink">{pickup}</Text>
        <Text className="mb-1 text-[13px] text-muted">To</Text>
        <Text className="text-base font-semibold text-ink">{destination}</Text>
      </View>

      <SectionTitle>When do you need a ride?</SectionTitle>

      <View className="mb-5 flex-row gap-3">
        <Pressable className="flex-1 rounded-field border border-line p-3" onPress={() => openPicker('date')}>
          <Text className="mb-1 text-[13px] text-muted">Date</Text>
          <Text className="text-[15px] font-semibold text-ink">{formatDate(scheduledAt)}</Text>
        </Pressable>

        <Pressable className="flex-1 rounded-field border border-line p-3" onPress={() => openPicker('time')}>
          <Text className="mb-1 text-[13px] text-muted">Time</Text>
          <Text className="text-[15px] font-semibold text-ink">{formatTime(scheduledAt)}</Text>
        </Pressable>
      </View>

      {showPicker && (
        <View className="mb-5">
          <DateTimePicker
            value={scheduledAt}
            mode={pickerMode}
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onValueChange={(_event, value) => onDateTimeChange(value)}
            onDismiss={() => setShowPicker(false)}
          />
          {Platform.OS === 'ios' ? (
            <Button title="Done" variant="outline" onPress={() => setShowPicker(false)} />
          ) : null}
        </View>
      )}

      <SectionTitle>Choose affordable ride</SectionTitle>

      {rideOptions.map((ride) => (
        <OptionCard
          key={ride.name}
          title={ride.name}
          description={`${ride.description} · ${ride.seats} seats`}
          trailing={formatPrice(ride.price)}
          tag={ride.name === cheapest.name ? 'Cheapest' : undefined}
          selected={selected === ride.name}
          onPress={() => setSelected(ride.name)}
        />
      ))}

      <Link href="/payment" asChild>
        <Pressable className="mb-4 mt-1 flex-row items-center justify-between rounded-field border border-line p-4 active:bg-surface">
          <View>
            <Text className="text-[13px] text-muted">Payment</Text>
            <Text className="mt-1 text-[15px] font-semibold text-ink">{paymentLabel(paymentMethod)}</Text>
          </View>
          <Text className="font-semibold text-ink">Change</Text>
        </Pressable>
      </Link>

      <Text className="mb-4 text-xs text-subtle">
        Rides can be scheduled from now up to 30 days ahead. Past dates and times are not accepted.
      </Text>

      <Button title={`Schedule Ride · ${formatPrice(selectedRide.price)}`} onPress={confirmRide} />
    </ScrollView>
  );
}
