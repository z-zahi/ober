import { Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'outline' | 'danger';

const containerClass: Record<Variant, string> = {
  primary: 'bg-ink',
  outline: 'border border-line bg-white',
  danger: 'border border-danger bg-white',
};

const labelClass: Record<Variant, string> = {
  primary: 'text-white',
  outline: 'text-ink',
  danger: 'text-danger',
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  className?: string;
};

export function Button({ title, variant = 'primary', disabled, className = '', ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`items-center rounded-field p-[17px] active:opacity-80 ${containerClass[variant]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...props}>
      <Text className={`text-base font-bold ${labelClass[variant]}`}>{title}</Text>
    </Pressable>
  );
}
