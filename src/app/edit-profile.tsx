import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { FormError } from '../components/FormError';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/auth-context';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState<string | null>(null);

  function save() {
    const message = updateProfile({ fullName, email, phone });
    setError(message);
    if (!message) router.back();
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="p-6 pb-12" keyboardShouldPersistTaps="handled">
        <View className="mb-6 items-center">
          <Avatar name={fullName} />
        </View>

        <TextField label="Full Name" value={fullName} onChangeText={setFullName} autoComplete="name" />
        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <TextField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <FormError message={error} />
        <Button title="Save Changes" onPress={save} />
        <Button title="Cancel" variant="outline" className="mt-3" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
