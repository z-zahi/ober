import { Text, View } from 'react-native';

export function Avatar({ name }: { name: string }) {
  return (
    <View className="h-[90px] w-[90px] items-center justify-center rounded-full bg-ink">
      <Text className="text-4xl font-bold text-white">{name.trim().charAt(0).toUpperCase() || '?'}</Text>
    </View>
  );
}
