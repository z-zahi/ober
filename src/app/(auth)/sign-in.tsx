import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/auth-context';
import { demoAccount } from '../../features/demo-data';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
          <Text className="text-4xl font-bold text-ink">Ober App</Text>
          <Text className="mt-5 text-[28px] font-bold text-ink">Welcome back</Text>
          <Text className="mb-[30px] mt-2 text-muted">Sign in to schedule your next ride.</Text>

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
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <FormError message={error} />
          <Button title="Sign In" onPress={() => setError(signIn(email, password))} />

          <View className="mt-5 flex-row justify-center">
            <Text className="text-muted">New to Ober? </Text>
            <Text accessibilityRole="link" className="font-bold text-ink" onPress={() => router.replace('/(auth)/sign-up')}>
              Create an account
            </Text>
          </View>

          <View className="mt-8 rounded-card bg-surface p-4">
            <Text className="font-semibold text-ink">Demo account</Text>
            <Text className="mt-1 text-[13px] text-muted">
              {demoAccount.user.email} · password {demoAccount.password}. Phase 1 keeps all data in memory.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
