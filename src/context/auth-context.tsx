import { createContext, useContext, useState, type ReactNode } from 'react';

import type { PaymentMethod, ProfileInput, SignUpInput, User } from '../features/account/types';
import { validateProfile, validateSignIn, validateSignUp } from '../features/account/validation';
import { demoAccount } from '../features/demo-data';
import { newId } from '../lib/format';

type Account = { user: User; password: string };

type AuthContextType = {
  user: User | null;
  /** Each action returns an error message for the screen to show, or null on success. */
  signIn: (email: string, password: string) => string | null;
  signUp: (input: SignUpInput) => string | null;
  signOut: () => void;
  updateProfile: (input: ProfileInput) => string | null;
  setPaymentMethod: (method: PaymentMethod) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([demoAccount]);
  const [userId, setUserId] = useState<string | null>(null);

  const user = accounts.find((account) => account.user.id === userId)?.user ?? null;

  const updateUser = (patch: Partial<User>) => {
    setAccounts((current) =>
      current.map((account) =>
        account.user.id === userId ? { ...account, user: { ...account.user, ...patch } } : account
      )
    );
  };

  const signIn = (email: string, password: string) => {
    const error = validateSignIn(email, password);
    if (error) return error;
    const account = accounts.find((item) => sameEmail(item.user.email, email));
    if (!account || account.password !== password) return 'Email or password is incorrect.';
    setUserId(account.user.id);
    return null;
  };

  const signUp = (input: SignUpInput) => {
    const error = validateSignUp(input);
    if (error) return error;
    if (accounts.some((item) => sameEmail(item.user.email, input.email))) {
      return 'An account with this email already exists.';
    }
    const created: User = {
      id: newId(),
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      paymentMethod: 'Cash',
    };
    setAccounts((current) => [...current, { user: created, password: input.password }]);
    setUserId(created.id);
    return null;
  };

  const updateProfile = (input: ProfileInput) => {
    const error = validateProfile(input);
    if (error) return error;
    if (accounts.some((item) => item.user.id !== userId && sameEmail(item.user.email, input.email))) {
      return 'Another account already uses this email.';
    }
    updateUser({ fullName: input.fullName.trim(), email: input.email.trim(), phone: input.phone.trim() });
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut: () => setUserId(null),
        updateProfile,
        setPaymentMethod: (paymentMethod) => updateUser({ paymentMethod }),
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
