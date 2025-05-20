import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function IndexPage() {
  const { isSignedIn } = useAuth();

  // Se não estiver autenticado, redireciona para login
  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  // Se estiver autenticado, redireciona para home
  return <Redirect href="/home" />;
}