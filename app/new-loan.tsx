import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Banknote, Calendar, AlignLeft, RefreshCw } from 'lucide-react-native';
import { Button } from 'prizmux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';
import { loanApi } from '@/api/loan';
import { userApi, IUser } from '@/api/user';
import { Search, User as UserIcon, Check, ChevronLeft } from 'lucide-react-native';
import { FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { BottomSheet, Header, Toast } from 'prizmux';

type Frequency = 'daily' | 'weekly' | 'biweekly';

export default function NewLoanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');

  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [duration, setDuration] = useState('30');
  const [selectedClient, setSelectedClient] = useState<IUser | null>(null);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { clientId } = useLocalSearchParams();
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });

  React.useEffect(() => {
    if (clientId && users) {
      const client = users.find(u => u._id === clientId);
      if (client) setSelectedClient(client);
    }
  }, [clientId, users]);

  const filteredUsers = users?.filter(u =>
    u.role === 'client' &&
    (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery))
  ) || [];

  const createLoanMutation = useMutation({
    mutationFn: loanApi.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setToastMessage({ title: 'Success', desc: 'Loan request submitted successfully!', type: 'success' });
      setToastVisible(true);
      setTimeout(() => router.back(), 2000);
    },
    onError: (error: any) => {
      setToastMessage({ title: 'Error', desc: error.response?.data?.message || 'Failed to submit loan request', type: 'error' });
      setToastVisible(true);
    },
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '', type: 'error' as 'error' | 'success' });

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToastMessage({ title: 'Invalid Amount', desc: 'Please enter a valid loan amount.', type: 'error' });
      setToastVisible(true);
      return;
    }
    if (!selectedClient) {
      setToastMessage({ title: 'Missing Client', desc: 'Please select a client for this loan.', type: 'error' });
      setToastVisible(true);
      return;
    }

    createLoanMutation.mutate({
      client: selectedClient._id as any,
      amount: Number(amount),
      interestRate: 20, // Default 20%
      durationDays: Number(duration),
      repaymentFrequency: frequency,
      startDate: new Date().toISOString(),
    });
  };

  const renderFrequencyOption = (option: Frequency, label: string) => (
    <TouchableOpacity
      style={[
        styles.frequencyBtn,
        { borderColor },
        frequency === option && { backgroundColor: tintColor, borderColor: tintColor }
      ]}
      onPress={() => setFrequency(option)}
    >
      <ThemedText style={[styles.frequencyText, frequency === option && { color: '#FFF' }]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Apply for Loan"
        showBack
        onBackPress={() => router.back()}
        backIcon={<ChevronLeft color={textColor} size={24} />}
        backgroundColor={background}
        titleStyle={{ color: textColor, fontFamily: 'Inter_700Bold', fontSize: 20 }}
        backButtonBackgroundColor="transparent"
        backIconColor={textColor}
        style={{ borderBottomWidth: 0, paddingTop: 50 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <UserIcon size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>Select Client</ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.textInput, { backgroundColor: inputBackground, borderColor, justifyContent: 'center' }]}
            onPress={() => setClientModalVisible(true)}
          >
            <ThemedText style={{ color: selectedClient ? textColor : '#999' }}>
              {selectedClient ? selectedClient.fullName : 'Choose a client...'}
              {selectedClient && ` (${selectedClient.phone})`}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Banknote size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>Loan Amount (UGX)</ThemedText>
          </View>
          <TextInput
            style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
            placeholder="e.g. 150000"
            placeholderTextColor={theme === 'light' ? '#999' : '#666'}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <RefreshCw size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>Repayment Frequency</ThemedText>
          </View>
          <View style={styles.frequencyRow}>
            {renderFrequencyOption('daily', 'Daily')}
            {renderFrequencyOption('weekly', 'Weekly')}
            {renderFrequencyOption('biweekly', 'Bi-Weekly')}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Calendar size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>Duration (Days)</ThemedText>
          </View>
          <TextInput
            style={[styles.textInput, { backgroundColor: inputBackground, color: textColor, borderColor }]}
            placeholder="30"
            placeholderTextColor={theme === 'light' ? '#999' : '#666'}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <View style={[styles.summaryCard, { backgroundColor: inputBackground, borderColor, borderWidth: 1 }]}>
          <ThemedText style={styles.summaryTitle}>Loan Summary</ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText>Interest Rate</ThemedText>
            <ThemedText type="boldPrecision">20%</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText>Total Repayable</ThemedText>
            <ThemedText type="boldPrecision">
              UGX {(Number(amount || 0) * 1.2).toLocaleString()}
            </ThemedText>
          </View>
        </View>

        <Button
          title={createLoanMutation.isPending ? "Submitting..." : "Submit Loan Request"}
          onPress={handleSubmit}
          fullWidth
          disabled={createLoanMutation.isPending}
          borderRadius={16}
          style={{ backgroundColor: tintColor, height: 56 } as any}
          textStyle={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: background }}
        />
      </ScrollView>

      <BottomSheet
        visible={clientModalVisible}
        onClose={() => setClientModalVisible(false)}
        title="Select Client"
        backgroundColor={inputBackground}
        textColor={textColor}
        handleColor={borderColor}
        titleStyle={{ fontFamily: 'Inter_700Bold' }}
      >
        <View style={styles.sheetContent}>
          <View style={[styles.searchBar, { backgroundColor: inputBackground, borderColor }]}>
            <Search size={20} color={textColor} style={{ opacity: 0.5 }} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search by name or phone..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.clientItem, { borderBottomColor: borderColor }]}
                onPress={() => {
                  setSelectedClient(item);
                  setClientModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <View style={styles.clientItemInfo}>
                  <ThemedText type="boldPrecision">{item.fullName}</ThemedText>
                  <ThemedText type="precision" style={{ fontSize: 13, opacity: 0.6 }}>
                    {item.phone} • {item.nationalId}
                  </ThemedText>
                </View>
                {selectedClient?._id === item._id && (
                  <Check size={20} color={tintColor} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <ThemedText style={{ opacity: 0.5 }}>
                  {loadingUsers ? 'Loading clients...' : 'No clients found matching your search.'}
                </ThemedText>
              </View>
            }
          />
        </View>
      </BottomSheet>

      <Toast
        visible={toastVisible}
        text={toastMessage.title}
        description={toastMessage.desc}
        type={toastMessage.type as any}
        onHide={() => setToastVisible(false)}
        swipeable={true}
        dismiss="manual"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
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
  textArea: {
    height: 120,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyText: {
    fontSize: 14,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetContent: {
    padding: 24,
    height: 500, // Fixed height for the sheet content
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  clientItemInfo: {
    gap: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
});
