import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Fingerprint,
  Mail,
  Phone,
  User,
  Building,
  Lock,
} from "lucide-react-native";
import { Button, Header, Toast, PhoneInput } from "prizmux";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRegister } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/auth-store";

export default function NewClientScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeCompanyId } = useAuthStore();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const textColor = useThemeColor({}, "text");
  const inputBackground = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "borderColor");
  const tintColor = useThemeColor({}, "tint");
  const background = useThemeColor({}, "background");
  const mutedText = useThemeColor({}, "mutedText");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState({
    countryCode: "UG",
    callingCode: "256",
    number: "",
    full: "",
  });
  const [nationalId, setNationalId] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    desc: "",
    type: "error" as "error" | "success",
  });

  const onboardMutation = useRegister(false);

  const handleOnboard = async () => {
    if (!fullName || !phone.number || !nationalId || !pin) {
      setToastMessage({
        title: "Missing Info",
        desc: "Full Name, Phone, National ID, and PIN are required.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }

    if (pin.length !== 4) {
      setToastMessage({
        title: "Invalid PIN",
        desc: "PIN must be exactly 4 digits.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }

    if (!activeCompanyId) {
      setToastMessage({
        title: "Configuration Error",
        desc: "No active company context. Please logout and login again.",
        type: "error",
      });
      setToastVisible(true);
      return;
    }

    try {
      // Clients onboarded by staff get a temporal password (their phone)
      // they can change it later if they ever get app access.
      await onboardMutation.mutateAsync({
        fullName,
        email: email.toLowerCase() || `${username || phone.number}@placeholder.com`,
        phone: phone.number,
        nationalId,
        username: username || phone.number,
        password: phone.number, // Temporal password
        pin,
        role: "client",
        companies: [activeCompanyId],
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      setToastMessage({
        title: "Success",
        desc: "Client onboarded successfully.",
        type: "success",
      });
      setToastVisible(true);
      setTimeout(() => router.back(), 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Onboarding failed.";
      setToastMessage({ title: "Error", desc: message, type: "error" });
      setToastVisible(true);
    }
  };

  const renderFlag = (country: any) => {
    // Simple flag emoji fallback if needed, or handle icons
    const flags: any = {
      UG: "🇺🇬",
      KE: "🇰🇪",
      TZ: "🇹🇿",
      RW: "🇷🇼",
      BI: "🇧🇮",
      SS: "🇸🇸",
      CD: "🇨🇩",
      SO: "🇸🇴",
    };
    return (
      <ThemedText style={{ fontSize: 20 }}>{flags[country.code] || "🏳️"}</ThemedText>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header
          title="Onboard New Client"
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="precision" style={styles.subtitle}>
              Enter the client's details to add them to your company. They will
              be immediately available for loan applications.
            </ThemedText>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={16} color={textColor} />
                <ThemedText type="precision" style={styles.label}>
                  Full Name
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
                placeholder="e.g. Samuel Okello"
                placeholderTextColor={mutedText}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
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
                onChange={(val: any) => setPhone(val)}
                backgroundColor={inputBackground}
                borderColor={borderColor}
                textColor={textColor}
                labelColor={textColor}
                pickerBackgroundColor={background}
                searchBackgroundColor={inputBackground}
                searchBorderColor={borderColor}
                inputStyle={{ fontFamily: "Inter_400Regular" }}
                labelStyle={{
                  color: textColor,
                  fontFamily: "Inter_400Regular",
                  marginBottom: 8,
                }}
                renderFlag={(country: any) => renderFlag(country)}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Fingerprint size={16} color={textColor} />
                <ThemedText type="precision" style={styles.label}>
                  National ID
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
                placeholder="NIN Number"
                placeholderTextColor={mutedText}
                value={nationalId}
                onChangeText={setNationalId}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Mail size={16} color={textColor} />
                <ThemedText type="precision" style={styles.label}>
                  Email Address (Optional)
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
                <ThemedText type="precision" style={styles.label}>
                  Username (Optional)
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
                placeholder="e.g. samuel_ok"
                placeholderTextColor={mutedText}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Lock size={16} color={textColor} />
                <ThemedText type="precision" style={styles.label}>
                  Security PIN (4 Digits)
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
                placeholder="0000"
                placeholderTextColor={mutedText}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={pin}
                onChangeText={(text) => setPin(text.replace(/[^0-9]/g, ""))}
              />
            </View>

            <Button
              title={
                onboardMutation.isPending ? "Processing..." : "Onboard Client"
              }
              onPress={handleOnboard}
              isLoading={onboardMutation.isPending}
              fullWidth
              borderRadius={16}
              style={
                [
                  { marginTop: 20, height: 56, backgroundColor: theme === 'dark' ? '#222' : tintColor },
                ] as any
              }
              textStyle={{
                color: '#FFF',
                fontFamily: "Inter_700Bold",
                fontSize: 18,
              }}
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: "Inter_600SemiBold",
  },
  textInput: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
});
