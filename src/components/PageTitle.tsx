import { Text, View } from 'react-native';

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-6 mt-2.5">
      <Text className="text-[28px] font-bold text-ink">{title}</Text>
      {subtitle ? <Text className="mt-1.5 text-muted">{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text className="mb-3 text-lg font-bold text-ink">{children}</Text>;
}
