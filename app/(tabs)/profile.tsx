import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'prizmux';
import { LogOut, User as UserIcon, Mail, Phone, Shield, Settings, ChevronRight } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const dangerColor = useThemeColor({}, 'danger');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please login to view your profile.</ThemedText>
        <Button 
          title="Go to Login" 
          onPress={() => router.replace('/(auth)/login')}
          style={styles.logoutBtn as any}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.profileHeader, { backgroundColor: cardBackground }]}>
        <View style={styles.avatarContainer}>
          <UserIcon size={40} color={textColor} />
        </View>
        <ThemedText type="boldPrecision" style={styles.userName}>{user.fullName}</ThemedText>
        <View style={[styles.roleBadge, { backgroundColor: tintColor }]}>
          <ThemedText style={[styles.roleText, { color: background }]}>{user.role.toUpperCase()}</ThemedText>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Mail size={20} color={textColor} style={styles.icon} />
          <View>
            <ThemedText type="precision" style={styles.label}>Email</ThemedText>
            <ThemedText type="precision">{user.email}</ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Phone size={20} color={textColor} style={styles.icon} />
          <View>
            <ThemedText type="precision" style={styles.label}>Phone</ThemedText>
            <ThemedText type="precision">{user.phone}</ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Shield size={20} color={textColor} style={styles.icon} />
          <View>
            <ThemedText type="precision" style={styles.label}>National ID</ThemedText>
            <ThemedText type="precision">{user.nationalId}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={[styles.settingsItem, { backgroundColor: cardBackground }]} 
          onPress={() => router.push('/settings')}
        >
          <View style={styles.settingsLeft}>
            <View style={[styles.settingsIconContainer, { backgroundColor: tintColor + '20' }]}>
              <Settings size={20} color={tintColor} />
            </View>
            <ThemedText type="precision" style={styles.settingsLabel}>Settings</ThemedText>
          </View>
          <ChevronRight size={20} color={textColor} opacity={0.3} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.logoutAction, { borderColor: dangerColor }]} 
        onPress={handleLogout}
      >
        <LogOut size={20} color={dangerColor} />
        <ThemedText style={[styles.logoutText, { color: dangerColor }]}>Sign Out</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(128,128,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    gap: 20,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  logoutBtn: {
    marginTop: 20,
    width: '100%',
  }
});
