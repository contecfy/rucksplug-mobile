import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Wallet,
} from "lucide-react-native";
import { EmptyState, Toast } from "prizmux";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { ILoan, loanApi } from "@/api/loan";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function LoansScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");
  const infoColor = useThemeColor({}, "info");
  const borderColor = useThemeColor({}, "borderColor");
  const fabIconColor = useThemeColor({}, "background"); // High contrast on tint

  const {
    data: loans,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["loans"],
    queryFn: loanApi.getLoans,
  });

  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState({
    title: "",
    desc: "",
    type: "error" as "error" | "success",
  });

  React.useEffect(() => {
    if (isError) {
      setToastMessage({
        title: "Fetch Failed",
        desc:
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          "Could not load loans",
        type: "error",
      });
      setToastVisible(true);
    }
  }, [isError, error]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
      case "approved":
        return successColor;
      case "pending":
        return warningColor;
      case "defaulted":
        return dangerColor;
      case "completed":
        return infoColor;
      default:
        return textColor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ongoing":
      case "approved":
        return <CheckCircle size={14} color="#FFF" />;
      case "pending":
        return <Clock size={14} color="#FFF" />;
      case "defaulted":
        return <AlertCircle size={14} color="#FFF" />;
      default:
        return null;
    }
  };

  const renderLoanCard = ({ item }: { item: ILoan }) => {
    const clientName =
      typeof item.client === "object" ? item.client.fullName : "Guest";

    return (
      <Pressable
        style={[
          styles.loanCard,
          { backgroundColor: cardBackground, borderColor },
        ]}
        onPress={() => router.push(`/loan/${item._id}`)}
      >
        <View style={styles.cardHeader}>
          <View>
            <ThemedText type="boldPrecision" style={styles.amountText}>
              UGX {item.amount.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.clientNameText}>{clientName}</ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            {getStatusIcon(item.status)}
            <ThemedText style={styles.statusText}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={textColor} style={styles.icon} />
            <ThemedText type="precision" style={styles.footerText}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Wallet size={16} color={textColor} style={styles.icon} />
            <ThemedText type="precision" style={styles.footerText}>
              UGX {item.remainingBalance.toLocaleString()} left
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={loans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={tintColor}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              style={styles.emptyContainer}
              titleStyle={{ color: textColor }}
              descriptionStyle={{ color: textColor }}
              title="No Active Loans"
              description="You don't have any active loans at the moment."
              icon={<Wallet size={48} color={tintColor} />}
            />
          ) : null
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: tintColor }]}
        onPress={() => router.push("/new-loan")}
      >
        <Plus color={fabIconColor} size={30} />
      </Pressable>

      <Toast
        visible={toastVisible}
        text={toastMessage.title}
        description={toastMessage.desc}
        type={toastMessage.type}
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

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loanCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  amountText: {
    fontSize: 22,
    marginBottom: 4,
  },
  clientNameText: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 2,
    fontFamily: "Inter_600SemiBold",
  },
  purposeText: {
    opacity: 0.6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    opacity: 0.7,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    backgroundColor: "transparent",
  },
  emptyText: {
    opacity: 0.5,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
