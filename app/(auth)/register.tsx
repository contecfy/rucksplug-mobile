import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRegister } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePublicCompanies } from "@/hooks/use-company";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import { Building2, Check, ChevronLeft, Search } from "lucide-react-native";
import { BottomSheet, Button, Header, Toast, PhoneInput } from "prizmux";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const cardBackground = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const buttonBackground = useThemeColor({}, "tint");
  const buttonText = useThemeColor({}, "background");
  const inputBackground = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "borderColor");
  const mutedText = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");
  const background = useThemeColor({}, "background");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<any>({
    country: { code: "UG", dial: "+256" },
    number: "",
    full: "",
  });
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<
    "loan_officer" | "manager" | "accountant" | "collector"
  >("loan_officer");

  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    desc: "",
    type: "error" as "error" | "success",
  });

  const registerMutation = useRegister();
  const { data: companies, isLoading: loadingCompanies } = usePublicCompanies();

  const filteredCompanies =
    companies?.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const roles = [
    { value: "loan_officer", label: "Loan Officer" },
    { value: "manager", label: "Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "collector", label: "Collector" },
  ];

  const handleRegister = async () => {
    if (
      !fullName ||
      !email ||
      !password ||
      !nationalId ||
      !selectedCompany ||
      !phone.number
    ) {
      setToastMessage({
        title: "Missing Info",
        desc: "Please fill in all required fields including National ID, phone and company.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }

    try {
      await registerMutation.mutateAsync({
        fullName,
        email: email.toLowerCase(),
        phone: phone.number,
        password,
        nationalId,
        role: selectedRole,
        companies: [selectedCompany.id], // User's first company
      });
      setToastMessage({
        title: "Success",
        desc: "Account created! Welcome to the team.",
        type: "success",
      });
      setToastVisible(true);
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed.";
      setToastMessage({ title: "Failed", desc: message, type: "error" });
      setToastVisible(true);
    }
  };

  const renderFlag = (country: any) => (
    <View style={styles.flagContainer}>
      <CountryFlag isoCode={country.code} size={18} style={styles.flag} />
    </View>
  );

  return (
    <ThemedView style={{ flex: 1, backgroundColor: background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <Header
            title="Staff Registration"
            showBack
            onBackPress={() => router.back()}
            backIcon={<ChevronLeft color={textColor} size={24} />}
            backgroundColor="transparent"
            titleStyle={{
              color: textColor,
              fontFamily: "Inter_700Bold",
              fontSize: 20,
            }}
          />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText type="precision" style={styles.subtitle}>
              Join your organization by creating a staff account. Clients must
              be onboarded internally.
            </ThemedText>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor,
                  borderWidth: 1,
                },
              ]}
            >
              <ThemedText type="precision" style={styles.inputLabel}>
                Full Name
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    color: textColor,
                    borderColor,
                  },
                ]}
                placeholder="e.g. John Doe"
                placeholderTextColor={mutedText}
                value={fullName}
                onChangeText={setFullName}
              />

              <ThemedText type="precision" style={styles.inputLabel}>
                Email Address
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    color: textColor,
                    borderColor,
                  },
                ]}
                placeholder="name@company.com"
                placeholderTextColor={mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <PhoneInput
                label="Phone Number"
                defaultCountryCode="UG"
                allowedCountries={[
                  "UG",
                  "KE",
                  "TZ",
                  "RW",
                  "BI",
                  "SS",
                  "CD",
                  "SO",
                ]}
                onChange={(val) => setPhone(val)}
                backgroundColor={inputBackground}
                borderColor={borderColor}
                textColor={textColor}
                labelColor={textColor}
                pickerBackgroundColor={background}
                searchBackgroundColor={inputBackground}
                searchBorderColor={borderColor}
                inputStyle={{ fontFamily: "Inter_400Regular" }}
                labelStyle={{ color: textColor, fontFamily: "Inter_400Regular" }}
                renderFlag={renderFlag}
              />

              <ThemedText type="precision" style={styles.inputLabel}>
                Password
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    color: textColor,
                    borderColor,
                  },
                ]}
                placeholder="At least 6 characters"
                placeholderTextColor={mutedText}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <ThemedText type="precision" style={styles.inputLabel}>
                National ID / ID Number
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBackground,
                    color: textColor,
                    borderColor,
                  },
                ]}
                placeholder="Enter your National ID"
                placeholderTextColor={mutedText}
                autoCapitalize="characters"
                value={nationalId}
                onChangeText={setNationalId}
              />

              <ThemedText type="precision" style={styles.inputLabel}>
                Choose Company
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.selector,
                  { backgroundColor: inputBackground, borderColor },
                ]}
                onPress={() => setCompanyModalVisible(true)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Building2
                    size={18}
                    color={selectedCompany ? tintColor : mutedText}
                  />
                  <ThemedText
                    style={{ color: selectedCompany ? textColor : mutedText }}
                  >
                    {selectedCompany
                      ? selectedCompany.name
                      : "Select your company"}
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <ThemedText type="precision" style={styles.inputLabel}>
                Your Role
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.selector,
                  { backgroundColor: inputBackground, borderColor },
                ]}
                onPress={() => setRoleModalVisible(true)}
              >
                <ThemedText style={{ color: textColor }}>
                  {roles.find((r) => r.value === selectedRole)?.label}
                </ThemedText>
              </TouchableOpacity>

              <Button
                title="Create Account"
                onPress={handleRegister}
                isLoading={registerMutation.isPending}
                fullWidth
                borderRadius={12}
                style={
                  [{ marginTop: 30, backgroundColor: buttonBackground }] as any
                }
                textStyle={{
                  color: buttonText,
                  fontFamily: "Inter_600SemiBold",
                }}
              />
            </View>
          </ScrollView>

          <BottomSheet
            visible={companyModalVisible}
            onClose={() => setCompanyModalVisible(false)}
            title="Select Company"
            backgroundColor={inputBackground}
            textColor={textColor}
            handleColor={borderColor}
          >
            <View style={styles.sheetContent}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: background, borderColor },
                ]}
              >
                <Search size={20} color={textColor} style={{ opacity: 0.5 }} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Search companies..."
                  placeholderTextColor={mutedText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <FlatList
                data={filteredCompanies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      { borderBottomColor: borderColor },
                    ]}
                    onPress={() => {
                      setSelectedCompany(item);
                      setCompanyModalVisible(false);
                      setSearchQuery("");
                    }}
                  >
                    <ThemedText type="boldPrecision">{item.name}</ThemedText>
                    {selectedCompany?.id === item.id && (
                      <Check size={20} color={tintColor} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <ThemedText style={{ opacity: 0.5 }}>
                      {loadingCompanies
                        ? "Loading companies..."
                        : "No companies found."}
                    </ThemedText>
                  </View>
                }
              />
            </View>
          </BottomSheet>

          <BottomSheet
            visible={roleModalVisible}
            onClose={() => setRoleModalVisible(false)}
            title="Select Your Role"
            backgroundColor={inputBackground}
            textColor={textColor}
          >
            <View style={styles.sheetContent}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[styles.listItem, { borderBottomColor: borderColor }]}
                  onPress={() => {
                    setSelectedRole(role.value as any);
                    setRoleModalVisible(false);
                  }}
                >
                  <ThemedText
                    type={
                      selectedRole === role.value
                        ? "boldPrecision"
                        : "precision"
                    }
                  >
                    {role.label}
                  </ThemedText>
                  {selectedRole === role.value && (
                    <Check size={20} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheet>

          <Toast
            visible={toastVisible}
            text={toastMessage.title}
            description={toastMessage.desc}
            type={toastMessage.type as any}
            onHide={() => setToastVisible(false)}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  subtitle: {
    opacity: 0.6,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
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
  },
  selector: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    justifyContent: "center",
  },
  sheetContent: {
    padding: 24,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  flagContainer: {
    width: 28,
    height: 20,
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  flag: {
    borderRadius: 2,
  },
});
