import React, { useState, useMemo } from 'react';
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
import { Header, Button, Toast } from 'prizmux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { loanApi, ILoan } from '@/api/loan';

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

  const showToast = (text: string, description: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastConfig({ text, description, type });
    setToastVisible(true);
  };

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => loanApi.getLoanById(id as string),
    enabled: !!id,
  });

  const updateLoanMutation = useMutation({
    mutationFn: (data: Partial<ILoan>) => loanApi.updateLoan(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      showToast('Success', 'Repayment status updated successfully', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update repayment status';
      showToast('Update Failed', message, 'error');
    },
  });

  // Calculate repayment track
  const { schedule, paymentPerPeriod, totalPayments } = useMemo(() => {
    if (!loan) return { schedule: [], paymentPerPeriod: 0, totalPayments: 0 };
    
    const repayments = [];
    const start = new Date(loan.startDate);
    const today = new Date();
    const frequency = loan.repaymentFrequency;
    const durationCount = loan.durationDays;
    
    let interval = 1;
    if (frequency === 'weekly') interval = 7;
    if (frequency === 'biweekly') interval = 14;
    
    const count = Math.ceil(durationCount / interval);
    const amountPerPeriod = loan.totalPayable / count;

    // Use totalRepaid to determine which days are paid
    const numberOfPaidPeriods = Math.round(loan.totalRepaid / amountPerPeriod);
    
    for (let i = 0; i < count; i++) {
        const dueDate = new Date(start);
        dueDate.setDate(start.getDate() + (i + 1) * interval);
        
        const isPast = dueDate < today;
        const isToday = dueDate.toDateString() === today.toDateString();
        const isPaid = i < numberOfPaidPeriods;
        const isMissed = isPast && !isPaid && !isToday;
        
        repayments.push({
            id: i,
            date: dueDate,
            isPaid,
            isMissed,
            isUpcoming: !isPast && !isToday,
            isToday
        });
    }
    return { schedule: repayments, paymentPerPeriod: amountPerPeriod, totalPayments: count };
  }, [loan]);

  const handleTogglePayment = (index: number, isPaid: boolean) => {
    if (!loan) return;

    const action = isPaid ? 'unpaid' : 'paid';
    import('react-native').then(({ Alert }) => {
        Alert.alert(
            `Mark as ${action}`,
            `Are you sure you want to mark this period as ${action}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Confirm', 
                    onPress: () => {
                        const newTotalPaidCount = isPaid ? index : index + 1;
                        const newTotalRepaid = Math.min(loan.totalPayable, newTotalPaidCount * paymentPerPeriod);
                        const newRemainingBalance = Math.max(0, loan.totalPayable - newTotalRepaid);

                        updateLoanMutation.mutate({
                            totalRepaid: newTotalRepaid,
                            remainingBalance: newRemainingBalance
                        });
                    }
                }
            ]
        );
    });
  };

  const missedCount = useMemo(() => 
    schedule.filter(s => s.isMissed).length, 
  [schedule]);

  if (isLoading || !loan) {
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
                {schedule.map((item, index) => (
                <View key={item.id} style={styles.trackItemContainer}>
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={() => handleTogglePayment(index, item.isPaid)}
                        style={[
                            styles.trackItem, 
                            { 
                                backgroundColor: item.isPaid ? successColor : item.isMissed ? dangerColor : item.isToday ? tintColor : cardBackground,
                                borderColor: item.isToday ? tintColor : borderColor,
                                borderWidth: 1
                            }
                        ]}
                    >
                    {item.isPaid ? <CheckCircle2 size={16} color="#FFF" /> : 
                    item.isMissed ? <AlertCircle size={16} color="#FFF" /> : 
                    item.isToday ? <Clock size={16} color="#FFF" /> :
                    <View style={[styles.dot, { backgroundColor: textColor + '40' }]} />}
                    </TouchableOpacity>
                    <ThemedText style={styles.trackDate}>{formatDate(item.date, 'MMM dd')}</ThemedText>
                    {index < schedule.length - 1 && (
                    <View style={[styles.connector, { backgroundColor: borderColor }]} />
                    )}
                </View>
                ))}
            </View>
          </ScrollView>
          <ThemedText style={styles.trackHint}>Tap any date to toggle payment status</ThemedText>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
            <Button 
                title={updateLoanMutation.isPending ? "Updating..." : "Mark Current as Paid"}
                onPress={() => {
                    const nextIndex = schedule.findIndex(s => !s.isPaid);
                    if (nextIndex !== -1) handleTogglePayment(nextIndex, false);
                }}
                fullWidth
                disabled={updateLoanMutation.isPending}
                borderRadius={16}
                style={{ backgroundColor: successColor, height: 56 } as any}
                textStyle={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFF' }}
            />
            <ThemedText style={styles.actionSubtext}>
               Next payment due: {formatDate(schedule.find(s => !s.isPaid)?.date || new Date(), 'long')}
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
    </ThemedView>
  );
}

// Helper date formatter
function formatDate(date: Date, type: 'MMM dd' | 'medium' | 'long') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (type === 'MMM dd') {
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
    }
    if (type === 'medium') {
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
    }
    return date.toDateString();
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
});
