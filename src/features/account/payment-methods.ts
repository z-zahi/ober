import type { PaymentMethod } from './types';

export const paymentMethods: { method: PaymentMethod; title: string; description: string }[] = [
  { method: 'Cash', title: 'Cash', description: 'Pay the driver at the end of the ride' },
  { method: 'Card', title: 'Credit or debit card', description: 'Pay the driver by card on board' },
  { method: 'Wallet', title: 'Mobile wallet', description: 'Pay from your phone wallet at drop-off' },
];

export function paymentLabel(method: PaymentMethod): string {
  return paymentMethods.find((option) => option.method === method)?.title ?? method;
}
