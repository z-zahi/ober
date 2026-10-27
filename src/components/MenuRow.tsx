import { Link, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type MenuRowProps = { title: string; value?: string; href: Href; last?: boolean };

export function MenuRow({ title, value, href, last }: MenuRowProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        className={`flex-row items-center justify-between py-4 active:opacity-60 ${
          last ? '' : 'border-b border-line-soft'
        }`}>
        <Text className="text-[15px] text-ink">{title}</Text>
        <View className="flex-row items-center gap-1">
          {value ? <Text className="text-[13px] text-subtle">{value}</Text> : null}
          <ChevronRight color="#888888" size={18} />
        </View>
      </Pressable>
    </Link>
  );
}
