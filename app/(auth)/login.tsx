import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, setActive, isLoaded } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!isLoaded) return;
    setError(null);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      await setActive({ session: result.createdSessionId });
      router.replace('/(tabs)/home'); // ajuste o caminho se necessário
    } catch (err: any) {
      setError('E-mail ou senha inválidos');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Floresta Sagrada</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

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

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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