export type PaymentMethod = 'Cash' | 'Card' | 'Wallet';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
};

export type SavedPlace = {
  id: string;
  userId: string;
  label: string;
  address: string;
};

export type ProfileInput = Pick<User, 'fullName' | 'email' | 'phone'>;

export type SignUpInput = ProfileInput & { password: string };
