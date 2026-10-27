import { Text, View } from 'react-native';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View className="mt-2.5 items-center rounded-card bg-surface p-6">
      <Text className="text-lg font-bold text-ink">{title}</Text>
      <Text className="mt-2 text-center text-muted">{message}</Text>
    </View>
  );
}
