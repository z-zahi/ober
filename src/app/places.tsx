import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { FormError } from '../components/FormError';
import { PageTitle, SectionTitle } from '../components/PageTitle';
import { TextField } from '../components/TextField';
import { usePlaces } from '../context/places-context';

export default function SavedPlacesScreen() {
  const { places, addPlace, removePlace } = usePlaces();
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  function save() {
    const message = addPlace(label, address);
    setError(message);
    if (!message) {
      setLabel('');
      setAddress('');
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="p-6 pb-12" keyboardShouldPersistTaps="handled">
        <PageTitle title="Saved Places" subtitle="Fill pickup and destination in one tap from Home." />

        {places.length === 0 ? (
          <View className="mb-6">
            <EmptyState title="No saved places" message="Add your home, work or university below." />
          </View>
        ) : (
          places.map((place) => (
            <View
              key={place.id}
              className="mb-3 flex-row items-center justify-between rounded-card border border-line-soft p-4">
              <View className="mr-3 flex-1">
                <Text className="text-lg font-bold text-ink">{place.label}</Text>
                <Text className="mt-1 text-muted">{place.address}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${place.label}`}
                onPress={() => removePlace(place.id)}
                className="rounded-field px-2 py-1 active:bg-surface">
                <Text className="font-semibold text-danger">Remove</Text>
              </Pressable>
            </View>
          ))
        )}

        <View className="mt-6">
          <SectionTitle>Add a place</SectionTitle>
          <TextField label="Name" placeholder="Home, Work, Gym…" value={label} onChangeText={setLabel} />
          <TextField label="Address" placeholder="Street, area or landmark" value={address} onChangeText={setAddress} />
          <FormError message={error} />
          <Button title="Save Place" onPress={save} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
