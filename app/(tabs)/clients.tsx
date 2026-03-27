import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Plus,
  Search,
  ShieldAlert,
  UserPlus
} from "lucide-react-native";
import { BottomSheet, Button, Toast } from "prizmux";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { IUser, userApi } from "@/api/user";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ClientsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "borderColor");
  const tintColor = useThemeColor({}, "tint");
  const background = useThemeColor({}, "background");

  const [discoveryModalVisible, setDiscoveryModalVisible] = useState(false);
  const [nationalIdSearch, setNationalIdSearch] = useState("");
  const [foundUser, setFoundUser] = useState<IUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    desc: "",
    type: "error" as "error" | "success",
  });

  // 1. Fetch Company Clients
  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });

  const clients = users?.filter((u) => u.role === "client") || [];

  // 2. Search by National ID
  const handleDiscoverySearch = async () => {
    if (!nationalIdSearch) return;
    setIsSearching(true);
    setFoundUser(null);
    try {
      const user = await userApi.searchByNationalId(nationalIdSearch);
      if (user) {
        setFoundUser(user);
      } else {
        setToastMessage({
          title: "Not Found",
          desc: "No user exists with this National ID.",
          type: "error",
        });
        setToastVisible(true);
      }
    } catch (e) {
      setToastMessage({
        title: "Error",
        desc: "Search failed. Please try again.",
        type: "error",
      });
      setToastVisible(true);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Link User to Company
  const linkMutation = useMutation({
    mutationFn: userApi.linkToCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setToastMessage({
        title: "Linked!",
        desc: "User added to your company.",
        type: "success",
      });
      setToastVisible(true);
      setDiscoveryModalVisible(false);
      setFoundUser(null);
      setNationalIdSearch("");
    },
    onError: (err: any) => {
      setToastMessage({
        title: "Link Failed",
        desc: err.response?.data?.message || "Could not link user.",
        type: "error",
      });
      setToastVisible(true);
    },
  });

  const renderClientItem = ({ item }: { item: IUser }) => (
    <TouchableOpacity
      style={[
        styles.clientCard,
        { backgroundColor: cardBackground, borderColor },
      ]}
      onPress={() => {}}
    >
      <View style={styles.clientAvatar}>
        <ThemedText style={styles.avatarText}>
          {item.fullName.charAt(0)}
        </ThemedText>
      </View>
      <View style={styles.clientInfo}>
        <ThemedText type="boldPrecision" style={styles.clientName}>
          {item.fullName}
        </ThemedText>
        <ThemedText type="precision" style={styles.clientDetails}>
          {item.phone} • {item.nationalId}
        </ThemedText>
      </View>
      <TouchableOpacity
        onPress={() => router.push(`/loan/new?clientId=${item._id}`)}
        style={[styles.listItemAction, { borderColor: tintColor }]}
      >
        <Plus size={20} color={tintColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="boldPrecision" style={styles.title}>
          Company Clients
        </ThemedText>
        <ThemedText type="precision" style={styles.subtitle}>
          Manage existing clients or discovery new ones
        </ThemedText>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.mainAction, { backgroundColor: tintColor }]}
          onPress={() => setDiscoveryModalVisible(true)}
        >
          <Search size={24} color={background} />
          <ThemedText style={[styles.actionText, { color: background }]}>Discover User</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { borderColor, borderWidth: 1 }]}
          onPress={() => router.push("/new-client")}
        >
          <UserPlus size={24} color={textColor} />
          <ThemedText style={{ color: textColor }}>Onboard New</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item._id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShieldAlert
              size={48}
              color={textColor}
              style={{ opacity: 0.2, marginBottom: 16 }}
            />
            <ThemedText style={{ opacity: 0.5 }}>
              No clients onboarded yet.
            </ThemedText>
          </View>
        }
      />

      <BottomSheet
        visible={discoveryModalVisible}
        onClose={() => setDiscoveryModalVisible(false)}
        title="Find User by National ID"
        backgroundColor={cardBackground}
        textColor={textColor}
      >
        <View style={styles.sheetContent}>
          <ThemedText type="precision" style={styles.sheetDesc}>
            Enter a user's National ID to find them across the platform and add
            them to your company.
          </ThemedText>

          <View style={[styles.searchInputRow, { borderColor }]}>
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Enter National ID..."
              placeholderTextColor="#999"
              value={nationalIdSearch}
              onChangeText={setNationalIdSearch}
            />
            <TouchableOpacity
              onPress={handleDiscoverySearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={tintColor} />
              ) : (
                <Search size={24} color={tintColor} />
              )}
            </TouchableOpacity>
          </View>

          {foundUser && (
            <View
              style={[
                styles.foundUserCard,
                { backgroundColor: background, borderColor },
              ]}
            >
              <View style={styles.foundUserInfo}>
                <ThemedText type="boldPrecision">
                  {foundUser.fullName}
                </ThemedText>
                <ThemedText
                  type="precision"
                  style={{ fontSize: 13, opacity: 0.6 }}
                >
                  {foundUser.email} • {foundUser.phone}
                </ThemedText>
              </View>
              <Button
                title="Link to Company"
                onPress={() => linkMutation.mutate(foundUser._id)}
                isLoading={linkMutation.isPending}
                borderRadius={8}
                style={{ height: 40, backgroundColor: tintColor }}
                textStyle={{ color: background, fontFamily: 'Inter_600SemiBold' }}
              />
            </View>
          )}
        </View>
      </BottomSheet>

      <Toast
        visible={toastVisible}
        text={toastMessage.title}
        description={toastMessage.desc}
        type={toastMessage.type}
        onHide={() => setToastVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  mainAction: {
    flex: 1.5,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontWeight: "bold",
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    opacity: 0.5,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clientName: {
    fontSize: 16,
  },
  clientDetails: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  actionBtn: {
    width: 40,
    padding: 0,
  },
  listItemAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sheetDesc: {
    opacity: 0.6,
    lineHeight: 20,
    marginBottom: 20,
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  foundUserCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  foundUserInfo: {
    flex: 1,
    marginRight: 10,
  },
});
