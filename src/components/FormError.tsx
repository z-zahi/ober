import { Text } from 'react-native';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text accessibilityRole="alert" className="mb-4 text-[15px] text-danger">
      {message}
    </Text>
  );
}
