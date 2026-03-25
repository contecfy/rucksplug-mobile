import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneInput, Button, Toast } from 'prizmux';
import CountryFlag from 'react-native-country-flag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLogin } from '@/hooks/use-auth';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const buttonBackground = useThemeColor({}, 'tint');
  const buttonText = useThemeColor({}, 'background');
  const inputBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'borderColor');
  const mutedText = useThemeColor({}, 'mutedText');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState<any>({ country: { code: 'UG', dial: '+256' }, number: '', full: '' });
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '', type: 'error' as 'error' | 'success' });

  const loginMutation = useLogin();
  
  const handleLogin = async () => {
    let loginParams = {};
    
    if (loginMethod === 'phone') {
      if (!phone.number || !pin) {
        setToastMessage({ title: 'Missing Info', desc: 'Please enter both phone and PIN.', type: 'error' });
        setToastVisible(true);
        return;
      }
      loginParams = { phone: phone.number, pin };
    } else {
      if (!email || !password) {
        setToastMessage({ title: 'Missing Info', desc: 'Please enter both email and password.', type: 'error' });
        setToastVisible(true);
        return;
      }
      loginParams = { email: email.toLowerCase(), password };
    }
    
    try {
      await loginMutation.mutateAsync(loginParams);
      setToastMessage({ title: 'Success', desc: 'Welcome back!', type: 'success' });
      setToastVisible(true);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Check your credentials and try again.';
      setToastMessage({ title: 'Login Failed', desc: message, type: 'error' });
      setToastVisible(true);
    }
  };

  const renderFlag = (country: any) => (
    <View style={styles.flagContainer}>
      <CountryFlag isoCode={country.code} size={18} style={styles.flag} />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={[styles.logo, { tintColor: textColor }]} 
            resizeMode="contain"
          />
          <ThemedText type="boldPrecision" style={styles.title}>Rucks Plug</ThemedText>
          <ThemedText type="precision" style={styles.subtitle}>Secure. Transparent. Controlled.</ThemedText>
        </ThemedView>

        <View style={[styles.card, { backgroundColor: cardBackground, borderColor, borderWidth: 1 }]}>
          <View style={[styles.methodToggle, { borderBottomColor: borderColor }]}>
            <TouchableOpacity 
              onPress={() => setLoginMethod('phone')}
              style={[
                styles.toggleBtn, 
                loginMethod === 'phone' && { borderBottomColor: textColor, borderBottomWidth: 2 }
              ]}
            >
              <ThemedText type="precision" style={[styles.toggleText, loginMethod === 'phone' && { color: textColor }]}>Phone</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setLoginMethod('email')}
              style={[
                styles.toggleBtn, 
                loginMethod === 'email' && { borderBottomColor: textColor, borderBottomWidth: 2 }
              ]}
            >
              <ThemedText type="precision" style={[styles.toggleText, loginMethod === 'email' && { color: textColor }]}>Email</ThemedText>
            </TouchableOpacity>
          </View>

          {loginMethod === 'phone' ? (
            <View>
              <PhoneInput
                label="Phone Number"
                defaultCountryCode="UG"
                allowedCountries={['UG', 'KE', 'TZ', 'RW', 'BI', 'SS', 'CD', 'SO']}
                onChange={(val) => setPhone(val)}
                backgroundColor={inputBackground}
                borderColor={borderColor}
                textColor={textColor}
                labelColor={textColor}
                pickerBackgroundColor={background}
                searchBackgroundColor={inputBackground}
                searchBorderColor={borderColor}
                inputStyle={{ fontFamily: 'Inter_400Regular' }}
                labelStyle={{ color: textColor, fontFamily: 'Inter_400Regular' }}
                renderFlag={renderFlag}
              />
              <ThemedText type="precision" style={styles.inputLabel}>PIN</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor, fontFamily: 'Inter_400Regular' }]}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={mutedText}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={pin}
                onChangeText={setPin}
              />
            </View>
          ) : (
            <View>
              <ThemedText type="precision" style={styles.inputLabel}>Email Address</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor, fontFamily: 'Inter_400Regular' }]}
                placeholder="e.g. name@example.com"
                placeholderTextColor={mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <ThemedText type="precision" style={styles.inputLabel}>Password</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor, fontFamily: 'Inter_400Regular' }]}
                placeholder="Enter your password"
                placeholderTextColor={mutedText}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          )}
          
          <Button
            title="Login"
            onPress={handleLogin}
            isLoading={loginMutation.isPending}
            fullWidth
            borderRadius={12}
            style={[{ marginTop: 24, backgroundColor: buttonBackground }] as any}
            textStyle={{ color: buttonText, fontFamily: 'Inter_600SemiBold' }}
          />
          
          <TouchableOpacity style={styles.forgotPassword} onPress={() => {}}>
            <ThemedText type="link" style={{ fontFamily: 'Inter_400Regular' }}>Forgot Credentials?</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText type="precision">Don't have an account? </ThemedText>
          <TouchableOpacity onPress={() => {}}>
            <ThemedText type="link" style={{ fontFamily: 'Inter_600SemiBold' }}>Register here</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        text={toastMessage.title}
        description={toastMessage.desc}
        type={toastMessage.type}
        onHide={() => setToastVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.6,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE', // Subtle border for flat design
  },
  methodToggle: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    opacity: 0.5,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  flagContainer: {
    width: 28,
    height: 20,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  flag: {
    borderRadius: 2,
  },
});
