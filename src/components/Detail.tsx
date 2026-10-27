import { Text, View } from 'react-native';

/** A grey caption with its value underneath, as on the Trips and Profile cards. */
export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-3">
      <Text className="text-[13px] text-subtle">{label}</Text>
      <Text className="mt-1 text-[15px] text-ink">{value}</Text>
    </View>
  );
}
