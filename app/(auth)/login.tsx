import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneInput, Button, Toast } from 'prizmux';
import CountryFlag from 'react-native-country-flag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const buttonBackground = theme === 'light' ? '#000000' : '#FFFFFF';
  const buttonText = theme === 'light' ? '#FFFFFF' : '#000000';
  const inputBackground = theme === 'light' ? '#FFFFFF' : '#222222';
  const borderColor = theme === 'light' ? '#EEEEEE' : '#333333';
  
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState<any>({ country: { code: 'UG', dial: '+256' }, number: '', full: '' });
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '' });
  
  const handleLogin = () => {
    if (loginMethod === 'phone') {
      if (!phone.number || !pin) {
        setToastMessage({ title: 'Missing Info', desc: 'Please enter both phone and PIN.' });
        setToastVisible(true);
        return;
      }
    } else {
      if (!email || !password) {
        setToastMessage({ title: 'Missing Info', desc: 'Please enter both email and password.' });
        setToastVisible(true);
        return;
      }
    }
    
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2000);
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
          <ThemedText type="title" style={styles.title}>Rucks Plug</ThemedText>
          <ThemedText style={styles.subtitle}>Secure. Transparent. Controlled.</ThemedText>
        </ThemedView>

        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.methodToggle}>
            <TouchableOpacity 
              onPress={() => setLoginMethod('phone')}
              style={[
                styles.toggleBtn, 
                loginMethod === 'phone' && { borderBottomColor: textColor, borderBottomWidth: 2 }
              ]}
            >
              <ThemedText style={[styles.toggleText, loginMethod === 'phone' && { color: textColor }]}>Phone</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setLoginMethod('email')}
              style={[
                styles.toggleBtn, 
                loginMethod === 'email' && { borderBottomColor: textColor, borderBottomWidth: 2 }
              ]}
            >
              <ThemedText style={[styles.toggleText, loginMethod === 'email' && { color: textColor }]}>Email</ThemedText>
            </TouchableOpacity>
          </View>

          {loginMethod === 'phone' ? (
            <View>
              <PhoneInput
                label="Phone Number"
                defaultCountryCode="UG"
                allowedCountries={['UG', 'KE', 'TZ', 'RW', 'BI', 'SS', 'CD', 'SO']}
                onChange={(val) => setPhone(val)}
                containerStyle={styles.input}
                inputStyle={{ color: textColor }}
                labelStyle={{ color: textColor }}
                renderFlag={renderFlag}
              />
              <ThemedText style={styles.inputLabel}>PIN</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={pin}
                onChangeText={setPin}
              />
            </View>
          ) : (
            <View>
              <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
                placeholder="e.g. name@example.com"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <ThemedText style={styles.inputLabel}>Password</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
                placeholder="Enter your password"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          )}
          
          <Button
            title="Login"
            onPress={handleLogin}
            isLoading={isLoading}
            fullWidth
            borderRadius={12}
            style={[{ marginTop: 24, backgroundColor: buttonBackground }] as any}
            textStyle={{ color: buttonText }}
          />
          
          <TouchableOpacity style={styles.forgotPassword} onPress={() => {}}>
            <ThemedText type="link">Forgot Credentials?</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={() => {}}>
            <ThemedText type="link">Register here</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        text={toastMessage.title}
        description={toastMessage.desc}
        type="error"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  methodToggle: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
    fontFamily: 'Bentham_400Regular',
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
