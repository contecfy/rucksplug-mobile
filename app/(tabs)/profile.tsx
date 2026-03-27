import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCompany } from "@/hooks/use-company";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "expo-router";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api/report';
import {
  Building,
  ChevronRight,
  Info,
  LogOut,
  Mail,
  Phone,
  Settings,
  Shield,
  TrendingUp,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Activity,
  Briefcase,
  PieChart as PieChartIcon,
} from "lucide-react-native";
import { Alert, BottomSheet, Button } from 'prizmux';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { user, activeCompanyId, logout } = useAuthStore();
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  
  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => reportApi.getFinancialSummary(),
  });
  const cardBackground = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const dangerColor = useThemeColor({}, "danger");
  const tintColor = useThemeColor({}, "tint");
  const background = useThemeColor({}, "background");
  const successColor = useThemeColor({}, "success");
  const infoColor = useThemeColor({}, "info");
  const borderColor = useThemeColor({}, "borderColor");

  const { data: company } = useCompany(activeCompanyId);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetchSummary();
    setRefreshing(false);
  }, [refetchSummary]);

  const formatCurrency = (amount: number) => {
    return `UGX ${Math.floor(amount).toLocaleString()}`;
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please login to view your profile.</ThemedText>
        <Button
          title="Go to Login"
          onPress={() => router.replace("/(auth)/login")}
          style={styles.logoutBtn as any}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
          }
        >
          <View
            style={[styles.profileHeader, { backgroundColor: cardBackground }]}
          >
            <View style={styles.avatarContainer}>
              <UserIcon size={40} color={textColor} />
            </View>
            <ThemedText type="boldPrecision" style={styles.userName}>
              {user.fullName}
            </ThemedText>
            <View style={styles.headerBadges}>
              <View style={[styles.roleBadge, { backgroundColor: tintColor }]}>
                <ThemedText style={[styles.roleText, { color: background }]}>
                  {user.role.toUpperCase()}
                </ThemedText>
              </View>
              {user.isVerified && (
                <View style={[styles.statusBadge, { backgroundColor: successColor + '15' }]}>
                   <CheckCircle size={10} color={successColor} />
                   <ThemedText style={[styles.statusBadgeText, { color: successColor }]}>VERIFIED</ThemedText>
                </View>
              )}
              {!user.isActive && (
                <View style={[styles.statusBadge, { backgroundColor: dangerColor + '15' }]}>
                   <XCircle size={10} color={dangerColor} />
                   <ThemedText style={[styles.statusBadgeText, { color: dangerColor }]}>INACTIVE</ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Mail size={20} color={textColor} style={styles.icon} />
              <View>
                <ThemedText type="precision" style={styles.label}>
                  Email
                </ThemedText>
                <ThemedText type="precision">{user.email}</ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Phone size={20} color={textColor} style={styles.icon} />
              <View>
                <ThemedText type="precision" style={styles.label}>
                  Phone
                </ThemedText>
                <ThemedText type="precision">{user.phone}</ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Shield size={20} color={textColor} style={styles.icon} />
              <View>
                <ThemedText type="precision" style={styles.label}>
                  National ID
                </ThemedText>
                <ThemedText type="precision">{user.nationalId}</ThemedText>
              </View>
            </View>
          </View>

          {/* Performance Summary Section */}
          {summary && (
            <View style={styles.statsSection}>
               <ThemedText type="boldPrecision" style={styles.sectionTitle}>Performance Summary</ThemedText>
               <View style={styles.statsGrid}>
                  <View style={[styles.statItemCompact, { backgroundColor: cardBackground, borderColor }]}>
                     <View style={[styles.statIconContainer, { backgroundColor: successColor + '15' }]}>
                        <Activity size={16} color={successColor} />
                     </View>
                     <ThemedText style={styles.statLabelCompact}>Collection</ThemedText>
                     <ThemedText type="boldPrecision" style={styles.statValueCompact}>{summary.collectionRate}%</ThemedText>
                  </View>

                  <View style={[styles.statItemCompact, { backgroundColor: cardBackground, borderColor }]}>
                     <View style={[styles.statIconContainer, { backgroundColor: tintColor + '15' }]}>
                        <Briefcase size={16} color={tintColor} />
                     </View>
                     <ThemedText style={styles.statLabelCompact}>Ongoing</ThemedText>
                     <ThemedText type="boldPrecision" style={styles.statValueCompact}>{summary.ongoingCount}</ThemedText>
                  </View>

                  <View style={[styles.statItemCompact, { backgroundColor: cardBackground, borderColor }]}>
                     <View style={[styles.statIconContainer, { backgroundColor: infoColor + '15' }]}>
                        <PieChartIcon size={16} color={infoColor} />
                     </View>
                     <ThemedText style={styles.statLabelCompact}>Active Total</ThemedText>
                     <ThemedText type="boldPrecision" style={styles.statValueCompact}>{formatCurrency(summary.activePortfolio)}</ThemedText>
                  </View>
               </View>
            </View>
          )}

          {/* Company Details Section */}
          {company && (
            <View style={styles.companySection}>
              <ThemedText type="boldPrecision" style={styles.sectionTitle}>
                Company Information
              </ThemedText>
              <View
                style={[
                  styles.companyCard,
                  { backgroundColor: cardBackground, borderColor },
                ]}
              >
                <View style={styles.companyInfoRow}>
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: tintColor + "15" },
                    ]}
                  >
                    <Building size={16} color={tintColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>
                      Registration Number
                    </ThemedText>
                    <ThemedText type="boldPrecision">
                      {company.registrationNumber || "N/A"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.companyInfoRow}>
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: successColor + "15" },
                    ]}
                  >
                    <TrendingUp size={16} color={successColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>
                      Monthly Interest Rate
                    </ThemedText>
                    <ThemedText
                      type="boldPrecision"
                      style={{ color: successColor }}
                    >
                      {company.interestRate}% Per Month
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.companyInfoRow}>
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: infoColor + "15" },
                    ]}
                  >
                    <Info size={16} color={infoColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>
                      Policy Overview
                    </ThemedText>
                    <ThemedText style={styles.policyText}>
                      {company.policy ||
                        "Standard organizational lending policies apply."}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.settingsSection}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => router.push("/settings")}
            >
              <View style={styles.settingsLeft}>
                <View style={styles.settingsIconContainer}>
                  <Settings size={20} color={textColor} />
                </View>
                <ThemedText type="precision" style={styles.settingsLabel}>
                  Settings
                </ThemedText>
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
                <ThemedText type="precision" style={styles.settingsLabel}>
                  Sign Out
                </ThemedText>
              </View>
              <ChevronRight size={20} color={textColor} opacity={0.3} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Alert
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        backgroundColor={cardBackground}
        titleColor={textColor}
        messageColor={textColor}
        overlayColor="rgba(0,0,0,0.7)"
      >
        <View style={styles.alertActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setLogoutModalVisible(false)}
            borderColor={borderColor}
            textColor={textColor}
            borderRadius={24}
            style={{ flex: 1, height: 48 } as any}
            showShadow={false}
          />
          <Button
            title="Sign Out"
            onPress={confirmLogout}
            backgroundColor={tintColor}
            textColor={background}
            borderRadius={24}
            style={{ flex: 1, height: 48 } as any}
            showShadow={false}
          />
        </View>
      </Alert>
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
    alignItems: "center",
    padding: 30,
    borderRadius: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(128,128,128,0.1)",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#000",
  },
  roleText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    gap: 20,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderRadius: 16,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  logoutBtn: {
    marginTop: 20,
    width: "100%",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
  alertActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItemCompact: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabelCompact: {
    fontSize: 10,
    opacity: 0.5,
  },
  statValueCompact: {
    fontSize: 13,
  },
});
