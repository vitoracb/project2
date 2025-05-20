import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, setActive, isLoaded } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  console.log('Auth:', auth);

  const handleLogin = async () => {
    console.log('Iniciando handleLogin');
    if (!isLoaded) {
      console.log('Clerk não carregado');
      return;
    }
    setError(null);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      console.log('Login bem-sucedido', result);
      await setActive({ session: result.createdSessionId });
      console.log('Sessão ativada, navegando para home...');
      router.replace('/home');
    } catch (err: any) {
      console.log('Erro no login:', err);
      setError('E-mail ou senha inválidos');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <User size={40} color="#2D6A4F" />
        </View>
        <Text style={styles.title}>Floresta Sagrada</Text>
        <Text style={styles.subtitle}>Conecte-se com a natureza</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={{ color: '#DC2626', marginBottom: 12 }}>{error}</Text>}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            console.log('Botão Entrar pressionado');
            handleLogin();
          }}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
    justifyContent: 'center',
  },
  inner: {
    padding: 32,
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF6EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6C584C',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#F5F7F9',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#2D6A4F',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  footerText: {
    color: '#6C584C',
    fontSize: 14,
  },
  footerLink: {
    color: '#2D6A4F',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
});