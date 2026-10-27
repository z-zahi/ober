import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = TextInputProps & { label: string };

export function TextField({ label, ...props }: TextFieldProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-[15px] font-semibold text-ink">{label}</Text>
      <TextInput
        className="rounded-field border border-line p-[15px] text-base text-ink"
        placeholderTextColor="#999999"
        {...props}
      />
    </View>
  );
}
