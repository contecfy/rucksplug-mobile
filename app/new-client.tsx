import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, User, Phone, Mail, Fingerprint, MapPin } from 'lucide-react-native';
import { Button, Header, Toast } from 'prizmux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';
import { useRegister } from '@/hooks/use-auth';

export default function NewClientScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeCompanyId } = useAuthStore();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const mutedText = useThemeColor({}, 'mutedText');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [username, setUsername] = useState('');
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '', type: 'error' as 'error' | 'success' });

  const onboardMutation = useRegister();

  const handleOnboard = async () => {
    if (!fullName || !phone || !nationalId) {
      setToastMessage({ title: 'Missing Info', desc: 'Full Name, Phone, and National ID are required.', type: 'error' });
      setToastVisible(true);
      return;
    }

    if (!activeCompanyId) {
      setToastMessage({ title: 'Configuration Error', desc: 'No active company context. Please logout and login again.', type: 'error' });
      setToastVisible(true);
      return;
    }

    try {
      // Clients onboarded by staff get a temporal password (their phone) 
      // they can change it later if they ever get app access.
      await onboardMutation.mutateAsync({
        fullName,
        email: email.toLowerCase() || `${username || phone}@placeholder.com`,
        phone,
        nationalId,
        username: username || phone,
        password: phone, // Temporal password
        role: 'client',
        companies: [activeCompanyId]
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setToastMessage({ title: 'Success', desc: 'Client onboarded successfully.', type: 'success' });
      setToastVisible(true);
      setTimeout(() => router.back(), 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Onboarding failed.';
      setToastMessage({ title: 'Error', desc: message, type: 'error' });
      setToastVisible(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Onboard New Client"
        showBack
        onBackPress={() => router.back()}
        backIcon={<ChevronLeft color={textColor} size={24} />}
        backgroundColor="transparent"
        titleStyle={{ color: textColor, fontFamily: 'Inter_700Bold', fontSize: 20 }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="precision" style={styles.subtitle}>
            Enter the client's details to add them to your company. They will be immediately available for loan applications.
          </ThemedText>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <User size={16} color={textColor} />
              <ThemedText type="precision" style={styles.label}>Full Name</ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
              placeholder="e.g. Samuel Okello"
              placeholderTextColor={mutedText}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Phone size={16} color={textColor} />
              <ThemedText type="precision" style={styles.label}>Phone Number</ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
              placeholder="+256..."
              placeholderTextColor={mutedText}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Fingerprint size={16} color={textColor} />
              <ThemedText type="precision" style={styles.label}>National ID</ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
              placeholder="NIN Number"
              placeholderTextColor={mutedText}
              value={nationalId}
              onChangeText={setNationalId}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Mail size={16} color={textColor} />
              <ThemedText type="precision" style={styles.label}>Email Address (Optional)</ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
              placeholder="client@example.com"
              placeholderTextColor={mutedText}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <User size={16} color={textColor} />
              <ThemedText type="precision" style={styles.label}>Username (Optional)</ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
              placeholder="e.g. samuel_ok"
              placeholderTextColor={mutedText}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Button
            title={onboardMutation.isPending ? "Processing..." : "Onboard Client"}
            onPress={handleOnboard}
            isLoading={onboardMutation.isPending}
            fullWidth
            borderRadius={16}
            style={[{ marginTop: 20, height: 56, backgroundColor: tintColor }] as any}
            textStyle={{ color: background, fontFamily: 'Inter_700Bold', fontSize: 18 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toastVisible}
        text={toastMessage.title}
        description={toastMessage.desc}
        type={toastMessage.type}
        onHide={() => setToastVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    opacity: 0.6,
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  textInput: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
});
