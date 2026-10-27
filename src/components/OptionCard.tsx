import { Pressable, Text, View } from 'react-native';

type OptionCardProps = {
  title: string;
  description: string;
  trailing?: string;
  tag?: string;
  selected: boolean;
  onPress: () => void;
};

/** A selectable row with a bold black border when chosen (ride options, payment methods). */
export function OptionCard({ title, description, trailing, tag, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mb-3 flex-row items-center justify-between rounded-card p-4 ${
        selected ? 'border-2 border-ink' : 'border border-line'
      }`}>
      <View className="mr-2 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-ink">{title}</Text>
          {tag ? (
            <Text className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-ink">{tag}</Text>
          ) : null}
        </View>
        <Text className="mt-1 text-muted">{description}</Text>
      </View>
      {trailing ? <Text className="text-base font-bold text-ink">{trailing}</Text> : null}
    </Pressable>
  );
}
