import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Detail } from '../../components/Detail';
import { MenuRow } from '../../components/MenuRow';
import { useAuth } from '../../context/auth-context';
import { usePlaces } from '../../context/places-context';
import { paymentLabel } from '../../features/account/payment-methods';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { places } = usePlaces();

  if (!user) return null;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="items-center p-6">
      <View className="mt-[30px]">
        <Avatar name={user.fullName} />
      </View>

      <Text className="mt-4 text-2xl font-bold text-ink">{user.fullName}</Text>
      <Text className="mb-[30px] mt-1.5 text-muted">{user.email}</Text>

      <View className="w-full rounded-card border border-line-soft p-[18px]">
        <Text className="text-lg font-bold text-ink">Personal Information</Text>
        <View className="my-4 h-px bg-line-soft" />

        <Detail label="Full Name" value={user.fullName} />
        <Detail label="Email Address" value={user.email} />
        <Detail label="Phone Number" value={user.phone} />
      </View>

      <View className="mt-4 w-full rounded-card border border-line-soft px-[18px]">
        <MenuRow title="Edit profile" href="/edit-profile" />
        <MenuRow title="Saved places" value={`${places.length}`} href="/places" />
        <MenuRow title="Payment method" value={paymentLabel(user.paymentMethod)} href="/payment" last />
      </View>

      <Button title="Sign Out" variant="outline" className="mt-6 w-full" onPress={signOut} />

      <Text className="mt-[30px] text-xs text-faint">Ober App</Text>
    </ScrollView>
  );
}
