import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'prizmux';
import { LogOut, User as UserIcon, Mail, Phone, Shield, Settings, ChevronRight, Building, TrendingUp, Info } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCompany } from '@/hooks/use-company';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, activeCompanyId, logout } = useAuthStore();
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const dangerColor = useThemeColor({}, 'danger');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const successColor = useThemeColor({}, 'success');
  const infoColor = useThemeColor({}, 'info');
  const borderColor = useThemeColor({}, 'borderColor');

  const { data: company } = useCompany(activeCompanyId);

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
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Company Details Section */}
          {company && (
            <View style={styles.companySection}>
              <ThemedText type="boldPrecision" style={styles.sectionTitle}>Company Information</ThemedText>
              <View style={[styles.companyCard, { backgroundColor: cardBackground, borderColor }]}>
                <View style={styles.companyInfoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: tintColor + '15' }]}>
                    <Building size={16} color={tintColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Registration Number</ThemedText>
                    <ThemedText type="boldPrecision">{company.registrationNumber || 'N/A'}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.companyInfoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: successColor + '15' }]}>
                    <TrendingUp size={16} color={successColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Monthly Interest Rate</ThemedText>
                    <ThemedText type="boldPrecision" style={{ color: successColor }}>{company.interestRate}% Per Month</ThemedText>
                  </View>
                </View>

                <View style={styles.companyInfoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: infoColor + '15' }]}>
                    <Info size={16} color={infoColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Policy Overview</ThemedText>
                    <ThemedText style={styles.policyText}>
                      {company.policy || 'Standard organizational lending policies apply.'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.settingsSection}>
            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={() => router.push('/settings')}
            >
              <View style={styles.settingsLeft}>
                <View style={styles.settingsIconContainer}>
                  <Settings size={20} color={textColor} />
                </View>
                <ThemedText type="precision" style={styles.settingsLabel}>Settings</ThemedText>
              </View>
              <ChevronRight size={20} color={textColor} opacity={0.3} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={handleLogout}
            >
              <View style={styles.settingsLeft}>
                <View style={styles.settingsIconContainer}>
                  <LogOut size={20} color={textColor} />
                </View>
                <ThemedText type="precision" style={styles.settingsLabel}>Sign Out</ThemedText>
              </View>
              <ChevronRight size={20} color={textColor} opacity={0.3} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    paddingVertical: 12,
    borderRadius: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  logoutBtn: {
    marginTop: 20,
    width: '100%',
  },
  companySection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  companyCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 2,
  },
  policyText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
  },
});
