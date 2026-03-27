import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  Users, 
  PieChart, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Info,
  Building2,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { reportApi } from '@/api/report';
import { useAuthStore } from '@/store/auth-store';
import { useCompany } from '@/hooks/use-company';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  const successColor = useThemeColor({}, 'success');
  const dangerColor = useThemeColor({}, 'danger');
  const infoColor = useThemeColor({}, 'info');
  const shadowColor = useThemeColor({}, 'black');

  const { user, activeCompanyId } = useAuthStore();
  
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => reportApi.getFinancialSummary(),
  });

  const { data: company } = useCompany(activeCompanyId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatCurrency = (amount: number) => {
    return `UGX ${Math.floor(amount).toLocaleString()}`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.statInfo}>
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
        <ThemedText type="boldPrecision" style={styles.statValue}>
          {typeof value === 'number' ? formatCurrency(value) : value}
        </ThemedText>
        {subValue && <ThemedText style={styles.statSubValue}>{subValue}</ThemedText>}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: background }]}>
        <View>
          <ThemedText style={styles.welcomeText}>Welcome back, {user?.fullName?.split(' ')[0]}</ThemedText>
          <View style={styles.companyTitleContainer}>
            <ThemedText type="boldPrecision" style={styles.dashboardTitle}>
              {company?.name || 'Dashboard'}
            </ThemedText>
            {company && (
              <ThemedText style={styles.companySubTitle}>
                {company.website || company.address || 'v1.0.0'}
              </ThemedText>
            )}
          </View>
        </View>
        <TouchableOpacity style={[styles.profileButton, { backgroundColor: cardBackground, borderColor }]}>
          <Users color={tintColor} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
        }
      >
        {/* Main Stats Summary */}
        <View style={[styles.mainBalanceCard, { backgroundColor: tintColor }]}>
          <View style={styles.mainBalanceHeader}>
            <ThemedText style={[styles.mainBalanceLabel, { color: background }]}>Active Portfolio Value</ThemedText>
            <PieChart color={background} size={20} opacity={0.8} />
          </View>
          <ThemedText style={[styles.mainBalanceValue, { color: background }]}>
            {formatCurrency(summary?.activePortfolio || 0)}
          </ThemedText>
          <View style={styles.mainBalanceFooter}>
            <View style={styles.mainBalanceStat}>
              <ThemedText style={[styles.mainStatLabel, { color: background }]}>Total Profit</ThemedText>
              <ThemedText style={[styles.mainStatValue, { color: background }]}>
                  {formatCurrency(summary?.totalProfit || 0)}
              </ThemedText>
            </View>
            <View style={[styles.verticalDivider, { backgroundColor: background }]} />
            <View style={styles.mainBalanceStat}>
              <ThemedText style={[styles.mainStatLabel, { color: background }]}>Repayment Rate</ThemedText>
              <ThemedText style={[styles.mainStatValue, { color: background }]}>
                  {summary?.collectionRate || 0}%
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.sectionHeader}>
            <ThemedText type="boldPrecision" style={styles.sectionTitle}>Overview</ThemedText>
        </View>

        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Lent" 
            value={summary?.totalLent || 0} 
            icon={Banknote} 
            color={infoColor}
            subValue={`${summary?.totalCount || 0} Total Loans`}
          />
          <StatCard 
            title="Interest Earned" 
            value={summary?.totalProfit || 0} 
            icon={TrendingUp} 
            color={successColor}
          />
          <StatCard 
            title="Principal Ledger" 
            value={summary?.activePrincipal || 0} 
            icon={Layers} 
            color={tintColor}
          />
          <StatCard 
            title="Collection Performance" 
            value={`${summary?.collectionRate || 0}%`} 
            icon={ArrowUpRight} 
            color={successColor}
          />
        </View>

        {/* Loan Counts */}
        <View style={styles.sectionHeader}>
            <ThemedText type="boldPrecision" style={styles.sectionTitle}>Portfolio Status</ThemedText>
        </View>

        <View style={styles.statusContainer}>
            <View style={[styles.statusItem, { backgroundColor: cardBackground, borderColor }]}>
                <ThemedText style={[styles.statusCount, { color: successColor }]}>{summary?.completedCount || 0}</ThemedText>
                <ThemedText style={styles.statusLabel}>Completed</ThemedText>
            </View>
            <View style={[styles.statusItem, { backgroundColor: cardBackground, borderColor }]}>
                <ThemedText style={[styles.statusCount, { color: tintColor }]}>{summary?.ongoingCount || 0}</ThemedText>
                <ThemedText style={styles.statusLabel}>Ongoing</ThemedText>
            </View>
            <View style={[styles.statusItem, { backgroundColor: cardBackground, borderColor }]}>
                <ThemedText style={[styles.statusCount, { color: dangerColor }]}>{summary?.defaultedCount || 0}</ThemedText>
                <ThemedText style={styles.statusLabel}>Defaulted</ThemedText>
            </View>
        </View>

        {/* Quick Links */}
        <TouchableOpacity 
            style={[styles.banner, { backgroundColor: infoColor + '10', borderColor: infoColor }]}
            onPress={() => router.push('/new-loan')}
        >
            <View style={styles.bannerContent}>
                <ThemedText style={[styles.bannerTitle, { color: infoColor }]}>Create New Loan</ThemedText>
                <ThemedText style={styles.bannerDescription}>Set up a new repayment schedule for a client</ThemedText>
            </View>
            <ArrowUpRight color={infoColor} size={24} />
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.6,
  },
  dashboardTitle: {
    fontSize: 24,
    lineHeight: 28,
  },
  companyTitleContainer: {
    marginTop: 2,
  },
  companySubTitle: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'Inter_400Regular',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  mainBalanceCard: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  mainBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainBalanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  mainBalanceValue: {
    fontSize: 32,
    marginBottom: 24,
  },
  mainBalanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  mainBalanceStat: {
    flex: 1,
  },
  mainStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  mainStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    gap: 4,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  statValue: {
    fontSize: 16,
  },
  statSubValue: {
    fontSize: 10,
    opacity: 0.4,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statusItem: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: 10,
    opacity: 0.6,
    fontWeight: '600',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  bannerContent: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerDescription: {
    fontSize: 12,
    opacity: 0.5,
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
