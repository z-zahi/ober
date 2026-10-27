import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '../components/Button';
import { OptionCard } from '../components/OptionCard';
import { PageTitle } from '../components/PageTitle';
import { useAuth } from '../context/auth-context';
import { paymentLabel, paymentMethods } from '../features/account/payment-methods';

export default function PaymentMethodScreen() {
  const { user, setPaymentMethod } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState(user?.paymentMethod ?? 'Cash');

  function save() {
    setPaymentMethod(selected);
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow p-6 pb-12">
      <PageTitle title="How will you pay?" subtitle="Used for every new ride you schedule." />

      {paymentMethods.map((option) => (
        <OptionCard
          key={option.method}
          title={option.title}
          description={option.description}
          tag={user?.paymentMethod === option.method ? 'Current' : undefined}
          selected={selected === option.method}
          onPress={() => setSelected(option.method)}
        />
      ))}

      <Text className="mb-4 mt-1 text-xs text-subtle">
        Ober never asks for card details in the app. You pay the driver directly at the end of the ride.
      </Text>

      <Button title={`Use ${paymentLabel(selected)}`} onPress={save} />
    </ScrollView>
  );
}
