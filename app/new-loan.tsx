import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Banknote, Calendar, RefreshCw } from "lucide-react-native";
import { Button } from "prizmux";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import { loanApi } from "@/api/loan";
import { IUser, userApi } from "@/api/user";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCompany } from "@/hooks/use-company";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  Search,
  User as UserIcon,
} from "lucide-react-native";
import { BottomSheet, Header, Toast } from "prizmux";
import { FlatList } from "react-native";

type Frequency = "daily" | "weekly" | "biweekly";

export default function NewLoanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, activeCompanyId } = useAuthStore();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const textColor = useThemeColor({}, "text");
  const inputBackground = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "borderColor");
  const tintColor = useThemeColor({}, "tint");
  const background = useThemeColor({}, "background");

  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [duration, setDuration] = useState("30");
  const [selectedClient, setSelectedClient] = useState<IUser | null>(null);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { clientId } = useLocalSearchParams();
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });

  const { data: company, isLoading: loadingCompany } =
    useCompany(activeCompanyId);
  const companyInterestRate = company?.interestRate || 20;

  React.useEffect(() => {
    if (clientId && users) {
      const client = users.find((u) => u._id === clientId);
      if (client) setSelectedClient(client);
    }
  }, [clientId, users]);

  const filteredUsers =
    users?.filter(
      (u) =>
        u.role === "client" &&
        (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.phone.includes(searchQuery)),
    ) || [];

  const createLoanMutation = useMutation({
    mutationFn: loanApi.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setToastMessage({
        title: "Success",
        desc: "Loan request submitted successfully!",
        type: "success",
      });
      setToastVisible(true);
      Alert.alert(
        "Loan Created",
        "The loan request has been submitted successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      setToastMessage({
        title: "Error",
        desc: error.response?.data?.message || "Failed to submit loan request",
        type: "error",
      });
      setToastVisible(true);
    },
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    desc: "",
    type: "error" as "error" | "success",
  });

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToastMessage({
        title: "Invalid Amount",
        desc: "Please enter a valid loan amount.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }
    if (!activeCompanyId) {
      setToastMessage({
        title: "Company Required",
        desc: "You must be associated with a company to create loans.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }
    if (!selectedClient) {
      setToastMessage({
        title: "Missing Client",
        desc: "Please select a client for this loan.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }

    createLoanMutation.mutate({
      company: activeCompanyId as string,
      client: selectedClient._id as string,
      amount: Number(amount),
      interestRate: companyInterestRate,
      durationDays: Number(duration),
      repaymentFrequency: frequency,
      startDate: new Date().toISOString(),
    });
  };

  const getFrequencyLabel = (option: Frequency) => {
    switch (option) {
      case "daily":
        return "Day";
      case "weekly":
        return "Week";
      case "biweekly":
        return "2 Weeks";
      default:
        return "";
    }
  };

  const getFrequencyDays = (option: Frequency) => {
    switch (option) {
      case "daily":
        return 1;
      case "weekly":
        return 7;
      case "biweekly":
        return 14;
      default:
        return 1;
    }
  };

  const totalRepayable = Number(amount || 0) * (1 + companyInterestRate / 100);
  const numInstallments = Math.max(
    1,
    Math.floor(Number(duration || 1) / getFrequencyDays(frequency)),
  );
  const installmentAmount = totalRepayable / numInstallments;

  const renderFrequencyOption = (option: Frequency, label: string) => (
    <TouchableOpacity
      style={[
        styles.frequencyBtn,
        { borderColor },
        frequency === option && {
          backgroundColor: tintColor,
          borderColor: tintColor,
        },
      ]}
      onPress={() => setFrequency(option)}
    >
      <ThemedText
        style={[
          styles.frequencyText,
          frequency === option && { color: background },
        ]}
      >
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
        titleStyle={{
          color: textColor,
          fontFamily: "Inter_700Bold",
          fontSize: 20,
        }}
        backButtonBackgroundColor="transparent"
        backIconColor={textColor}
        style={{ borderBottomWidth: 0, paddingTop: 50 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <UserIcon size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>
              Select Client
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.textInput,
              {
                backgroundColor: inputBackground,
                borderColor,
                justifyContent: "center",
              },
            ]}
            onPress={() => setClientModalVisible(true)}
          >
            <ThemedText style={{ color: selectedClient ? textColor : "#999" }}>
              {selectedClient ? selectedClient.fullName : "Choose a client..."}
              {selectedClient && ` (${selectedClient.phone})`}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Banknote size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>
              Loan Amount (UGX)
            </ThemedText>
          </View>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: inputBackground,
                color: textColor,
                borderColor,
              },
            ]}
            placeholder="e.g. 150000"
            placeholderTextColor={theme === "light" ? "#999" : "#666"}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <RefreshCw size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>
              Repayment Frequency
            </ThemedText>
          </View>
          <View style={styles.frequencyRow}>
            {renderFrequencyOption("daily", "Daily")}
            {renderFrequencyOption("weekly", "Weekly")}
            {renderFrequencyOption("biweekly", "Bi-Weekly")}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Calendar size={16} color={textColor} />
            <ThemedText type="precision" style={styles.label}>
              Duration (Days)
            </ThemedText>
          </View>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: inputBackground,
                color: textColor,
                borderColor,
              },
            ]}
            placeholder="30"
            placeholderTextColor={theme === "light" ? "#999" : "#666"}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: inputBackground, borderColor, borderWidth: 1 },
          ]}
        >
          <ThemedText style={styles.summaryTitle}>Loan Summary</ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText>Interest Rate</ThemedText>
            <ThemedText type="boldPrecision">{companyInterestRate}%</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText>Total Repayable</ThemedText>
            <ThemedText type="boldPrecision">
              UGX {totalRepayable.toLocaleString()}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <View style={styles.summaryRow}>
            <ThemedText style={{ color: tintColor, fontWeight: "bold" }}>
              Installment Amount
            </ThemedText>
            <ThemedText type="boldPrecision" style={{ color: tintColor }}>
              UGX{" "}
              {installmentAmount.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              / {getFrequencyLabel(frequency)}
            </ThemedText>
          </View>
        </View>

        <Button
          title="Submit Loan Request"
          onPress={handleSubmit}
          fullWidth
          isLoading={createLoanMutation.isPending}
          borderRadius={16}
          showShadow={false}
          style={
            {
              backgroundColor: theme === "dark" ? "#222" : tintColor,
              height: 56,
            } as any
          }
          textStyle={{
            fontSize: 18,
            fontFamily: "Inter_700Bold",
            color: "#FFF",
          }}
        />
      </ScrollView>

      <BottomSheet
        visible={clientModalVisible}
        onClose={() => setClientModalVisible(false)}
        title="Select Client"
        backgroundColor={inputBackground}
        textColor={textColor}
        handleColor={borderColor}
        titleStyle={{ fontFamily: "Inter_700Bold" }}
      >
        <View style={styles.sheetContent}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: inputBackground, borderColor },
            ]}
          >
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
                  setSearchQuery("");
                }}
              >
                <View style={styles.clientItemInfo}>
                  <ThemedText type="boldPrecision">{item.fullName}</ThemedText>
                  <ThemedText
                    type="precision"
                    style={{ fontSize: 13, opacity: 0.6 }}
                  >
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
                  {loadingUsers
                    ? "Loading clients..."
                    : "No clients found matching your search."}
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
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
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
    textAlignVertical: "top",
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 8,
  },
  frequencyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frequencyText: {
    fontSize: 14,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    opacity: 0.8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  sheetContent: {
    padding: 24,
    height: 500, // Fixed height for the sheet content
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  clientItemInfo: {
    gap: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
});
