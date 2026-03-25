import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Banknote, 
  User, 
  TrendingUp,
} from 'lucide-react-native';
import { Header, Button, Toast, Alert as PrizmuxAlert } from 'prizmux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { loanApi, ILoan, ISchedule } from '@/api/loan';

const { width } = Dimensions.get('window');

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  const successColor = useThemeColor({}, 'success');
  const dangerColor = useThemeColor({}, 'danger');
  const warningColor = useThemeColor({}, 'warning');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState({ 
    text: '', 
    description: '', 
    type: 'info' as 'success' | 'error' | 'info' | 'warning' 
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (text: string, description: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastConfig({ text, description, type });
    setToastVisible(true);
  };

  const { data: loan, isLoading: isLoadingLoan } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => loanApi.getLoanById(id as string),
    enabled: !!id,
  });

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['loan-schedule', id],
    queryFn: () => loanApi.getScheduleByLoanId(id as string),
    enabled: !!id,
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ scheduleId, status, paidAmount }: { scheduleId: string, status: string, paidAmount?: number }) => 
        loanApi.updateScheduleStatus(scheduleId, status, paidAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['loan-schedule', id] });
      showToast('Success', 'Repayment updated successfully', 'success');
    },
    onError: (error: any) => {
        const message = error.response?.data?.message || error.message || 'Failed to update repayment status';
        showToast('Update Failed', message, 'error');
    },
  });

  const formatDate = useCallback((date: Date, type: 'MMM dd' | 'medium' | 'long') => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (type === 'MMM dd') {
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
    }
    if (type === 'medium') {
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
    }
    return date.toDateString();
  }, []);

  const handleTogglePayment = (scheduleIndex: number, isPaid: boolean) => {
    if (!loan || !schedules) return;

    const scheduleItem = schedules[scheduleIndex];
    if (!scheduleItem) return;

    const action = isPaid ? 'unpaid' : 'paid';
    setAlertConfig({
        title: `Mark as ${action}`,
        message: `Are you sure you want to mark this period as ${action}?`,
        onConfirm: () => {
            updateScheduleMutation.mutate({
                scheduleId: scheduleItem._id,
                status: isPaid ? 'pending' : 'paid',
                paidAmount: isPaid ? 0 : scheduleItem.expectedAmount
            });
            setAlertVisible(false);
        }
    });
    setAlertVisible(true);
  };

  const missedCount = useMemo(() => 
    (schedules || []).filter(s => s.status === 'missed' || (s.status === 'pending' && new Date(s.dueDate) < new Date() && new Date(s.dueDate).toDateString() !== new Date().toDateString())).length, 
  [schedules]);

  if (isLoadingLoan || !loan) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading loan details...</ThemedText>
      </ThemedView>
    );
  }

  const clientName = typeof loan.client === 'object' ? loan.client.fullName : 'Client';

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Loan Details"
        showBack
        onBackPress={() => router.back()}
        backIcon={<ChevronLeft color={textColor} size={24} />}
        backgroundColor={background}
        titleStyle={{ color: textColor, fontFamily: 'Inter_700Bold', fontSize: 20 }}
        backButtonBackgroundColor="transparent"
        backIconColor={textColor}
        style={{ borderBottomWidth: 0, paddingTop: 50 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Loan Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.summaryHeader}>
            <View>
              <ThemedText style={styles.label}>Total Balance</ThemedText>
              <ThemedText type="boldPrecision" style={styles.balanceText}>
                UGX {loan.remainingBalance.toLocaleString()}
              </ThemedText>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: loan.riskStatus === 'green' ? successColor : loan.riskStatus === 'red' ? dangerColor : warningColor }]}>
               <ThemedText style={styles.riskText}>{loan.riskStatus.toUpperCase()}</ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Principal</ThemedText>
              <ThemedText type="boldPrecision">UGX {loan.amount.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Interest ({loan.interestRate}%)</ThemedText>
              <ThemedText type="boldPrecision">UGX {loan.interestAmount.toLocaleString()}</ThemedText>
            </View>
          </View>
        </View>

        {/* Missed Days Alert */}
        {missedCount > 0 && (
          <View style={[styles.alertCard, { backgroundColor: dangerColor + '20', borderColor: dangerColor }]}>
            <AlertCircle color={dangerColor} size={20} />
            <ThemedText style={{ color: dangerColor, fontFamily: 'Inter_600SemiBold', flex: 1 }}>
              {clientName} has missed {missedCount} {loan.repaymentFrequency === 'daily' ? 'days' : 'payments'}!
            </ThemedText>
          </View>
        )}

        {/* Custom Repayment Track (Mini Calendar) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="boldPrecision" style={styles.sectionTitle}>Repayment Track</ThemedText>
            <View style={styles.frequencyBadge}>
              <ThemedText style={styles.frequencyText}>{loan.repaymentFrequency.toUpperCase()}</ThemedText>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackContent}>
            <View style={styles.trackContainer}>
                {(schedules || []).map((item, index) => {
                    const isPaid = item.status === 'paid';
                    const isMissed = item.status === 'missed' || (item.status === 'pending' && new Date(item.dueDate) < new Date() && new Date(item.dueDate).toDateString() !== new Date().toDateString());
                    const isToday = new Date(item.dueDate).toDateString() === new Date().toDateString();

                    return (
                        <View key={item._id} style={styles.trackItemContainer}>
                            <TouchableOpacity 
                                activeOpacity={0.7}
                                onPress={() => handleTogglePayment(index, isPaid)}
                                style={[
                                    styles.trackItem, 
                                    { 
                                        backgroundColor: isPaid ? successColor : isMissed ? dangerColor : isToday ? tintColor : cardBackground,
                                        borderColor: isToday ? tintColor : borderColor,
                                        borderWidth: 1
                                    }
                                ]}
                            >
                            {isPaid ? <CheckCircle2 size={16} color="#FFF" /> : 
                            isMissed ? <AlertCircle size={16} color="#FFF" /> : 
                            isToday ? <Clock size={16} color="#FFF" /> :
                            <View style={[styles.dot, { backgroundColor: textColor + '40' }]} />}
                            </TouchableOpacity>
                            <ThemedText style={styles.trackDate}>{formatDate(new Date(item.dueDate), 'MMM dd')}</ThemedText>
                            {index < schedules!.length - 1 && (
                            <View style={[styles.connector, { backgroundColor: borderColor }]} />
                            )}
                        </View>
                    );
                })}
            </View>
          </ScrollView>
          <ThemedText style={styles.trackHint}>Tap any date to toggle payment status</ThemedText>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
            <Button 
                title={updateScheduleMutation.isPending ? "Updating..." : "Mark Current as Paid"}
                onPress={() => {
                    const nextIndex = (schedules || []).findIndex(s => s.status !== 'paid');
                    if (nextIndex !== -1) handleTogglePayment(nextIndex, false);
                }}
                fullWidth
                disabled={updateScheduleMutation.isPending}
                borderRadius={16}
                style={{ backgroundColor: successColor, height: 56 } as any}
                textStyle={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFF' }}
            />
            <ThemedText style={styles.actionSubtext}>
               Next payment due: {formatDate(new Date((schedules || []).find(s => s.status !== 'paid')?.dueDate || new Date()), 'long')}
            </ThemedText>
        </View>

        {/* Additional Details */}
        <View style={[styles.detailsCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.detailRow}>
                <User size={18} color={textColor} opacity={0.6} />
                <ThemedText style={styles.detailLabel}>Client</ThemedText>
                <ThemedText type="boldPrecision">{clientName}</ThemedText>
            </View>
            <View style={styles.detailRow}>
                <CalendarIcon size={18} color={textColor} opacity={0.6} />
                <ThemedText style={styles.detailLabel}>Start Date</ThemedText>
                <ThemedText type="boldPrecision">{formatDate(new Date(loan.startDate), 'medium')}</ThemedText>
            </View>
            <View style={styles.detailRow}>
                <TrendingUp size={18} color={textColor} opacity={0.6} />
                <ThemedText style={styles.detailLabel}>Frequency</ThemedText>
                <ThemedText type="boldPrecision" style={{ textTransform: 'capitalize' }}>{loan.repaymentFrequency}</ThemedText>
            </View>
            <View style={styles.detailRow}>
                <Banknote size={18} color={textColor} opacity={0.6} />
                <ThemedText style={styles.detailLabel}>Total To Repay</ThemedText>
                <ThemedText type="boldPrecision">UGX {loan.totalPayable.toLocaleString()}</ThemedText>
            </View>
        </View>

      </ScrollView>

      <Toast
        visible={toastVisible}
        text={toastConfig.text}
        description={toastConfig.description}
        type={toastConfig.type}
        onHide={() => setToastVisible(false)}
        swipeable={true}
        dismiss="manual"
        duration={5000}
      />

      <PrizmuxAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        backgroundColor={cardBackground}
        titleColor={textColor}
        messageColor={textColor}
        overlayColor="rgba(0,0,0,0.7)"
      >
        <View style={styles.alertActions}>
            <Button 
                title="Cancel" 
                variant="outline" 
                onPress={() => setAlertVisible(false)} 
                borderColor={borderColor}
                textColor={textColor}
                borderRadius={24}
                style={{ flex: 1, height: 48 } as any}
            />
            <Button 
                title="Confirm" 
                onPress={alertConfig.onConfirm}
                backgroundColor={tintColor}
                textColor={background}
                borderRadius={24}
                style={{ flex: 1, height: 48 } as any}
            />
        </View>
      </PrizmuxAlert>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 28,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 20,
    opacity: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.5,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  frequencyBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  frequencyText: {
    fontSize: 10,
    opacity: 0.6,
    fontWeight: 'bold',
  },
  trackHint: {
    fontSize: 12,
    opacity: 0.4,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  trackContent: {
    paddingVertical: 10,
  },
  trackContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 4,
  },
  trackItemContainer: {
    alignItems: 'center',
    width: 60,
  },
  trackItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  trackDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connector: {
    position: 'absolute',
    top: 22,
    left: 44,
    width: 36,
    height: 2,
    opacity: 0.2,
    zIndex: 1,
  },
  actionContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  actionSubtext: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 12,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
});
