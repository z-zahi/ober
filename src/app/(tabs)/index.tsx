import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { usePlaces } from '../../context/places-context';

type Field = 'pickup' | 'destination';

export default function HomeScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [activeField, setActiveField] = useState<Field>('destination');
  const { places } = usePlaces();
  const router = useRouter();

  function chooseRide() {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert('Missing details', 'Please enter pickup and destination.');
      return;
    }

    router.push({
      pathname: '/ride/confirm',
      params: { pickup: pickup.trim(), destination: destination.trim() },
    });
  }

  function fillFromPlace(address: string) {
    if (activeField === 'pickup') setPickup(address);
    else setDestination(address);
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="flex-grow justify-center p-6"
      keyboardShouldPersistTaps="handled">
      <Text className="text-4xl font-bold text-ink">Ober App</Text>
      <Text className="mt-5 text-[28px] font-bold text-ink">Where to?</Text>
      <Text className="mb-[30px] mt-2 text-muted">Plan your next ride.</Text>

      <TextField
        label="Pickup location"
        placeholder="Enter pickup location"
        value={pickup}
        onChangeText={setPickup}
        onFocus={() => setActiveField('pickup')}
      />

      <TextField
        label="Destination"
        placeholder="Where are you going?"
        value={destination}
        onChangeText={setDestination}
        onFocus={() => setActiveField('destination')}
      />

      <View className="mb-5">
        <Text className="mb-2 text-[13px] text-subtle">
          Saved places · tap one to fill the {activeField === 'pickup' ? 'pickup location' : 'destination'}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {places.map((place) => (
            <Pressable
              key={place.id}
              accessibilityRole="button"
              onPress={() => fillFromPlace(place.address)}
              className="rounded-full border border-line px-4 py-2 active:bg-surface">
              <Text className="font-semibold text-ink">{place.label}</Text>
            </Pressable>
          ))}
          <Link href="/places" asChild>
            <Pressable accessibilityRole="button" className="rounded-full bg-surface px-4 py-2 active:opacity-70">
              <Text className="font-semibold text-muted">+ Add place</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <Button title="Choose a Ride" className="mt-2" onPress={chooseRide} />
      <Text className="mt-4 text-xs text-muted">Made by Daniella</Text>
    </ScrollView>
  );
}
