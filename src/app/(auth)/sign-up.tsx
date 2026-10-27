import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/auth-context';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
          <Text className="text-4xl font-bold text-ink">Ober App</Text>
          <Text className="mt-5 text-[28px] font-bold text-ink">Create account</Text>
          <Text className="mb-[30px] mt-2 text-muted">It takes less than a minute.</Text>

          <TextField label="Full Name" placeholder="Your name" value={fullName} onChangeText={setFullName} />
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <TextField
            label="Phone Number"
            placeholder="+20 1001234567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextField
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <FormError message={error} />
          <Button title="Sign Up" onPress={() => setError(signUp({ fullName, email, phone, password }))} />

          <View className="mt-5 flex-row justify-center">
            <Text className="text-muted">Already have an account? </Text>
            <Text accessibilityRole="link" className="font-bold text-ink" onPress={() => router.replace('/(auth)/sign-in')}>
              Sign in
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
