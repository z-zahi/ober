import { Redirect } from 'expo-router';

import { useAuth } from '../context/auth-context';

/** Entry gate: signed-in riders go to Home, everyone else to Sign In. */
export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/(tabs)' : '/(auth)/sign-in'} />;
}
