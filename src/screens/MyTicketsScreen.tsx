import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "../api/client";
import type { Registration, EventItem } from "../api/types";
import { theme } from "../theme";

export default function MyTicketsScreen({ navigation }: any) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const q = useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => {
      const res = await api.get<{
        upcoming: Registration[];
        past: Registration[];
      }>("/me/registrations");
      return res.data;
    },
  });

  const list = tab === "upcoming" ? q.data?.upcoming ?? [] : q.data?.past ?? [];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.heading}>My tickets</Text>
        <View style={styles.tabs}>
          <Tab
            label={`Upcoming (${q.data?.upcoming.length ?? 0})`}
            active={tab === "upcoming"}
            onPress={() => setTab("upcoming")}
          />
          <Tab
            label={`Past (${q.data?.past.length ?? 0})`}
            active={tab === "past"}
            onPress={() => setTab("past")}
          />
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={q.isFetching}
            onRefresh={() => q.refetch()}
          />
        }
        ListEmptyComponent={
          !q.isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {tab === "upcoming" ? "No upcoming tickets" : "No past events"}
              </Text>
              <Text style={styles.emptyBody}>
                {tab === "upcoming"
                  ? "Browse events and register to get a digital ticket."
                  : "Attended events will appear here."}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const ev = item.event as EventItem;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("TicketDetail", { registrationId: item.id })
              }
              activeOpacity={0.9}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{ev.title}</Text>
                <Text style={styles.cardMeta}>
                  {format(new Date(ev.startAt), "EEE, MMM d · h:mm a")}
                </Text>
                <Text style={styles.cardMeta}>{ev.venue}</Text>
                <View style={styles.cardFooter}>
                  {item.checkedInAt ? (
                    <View style={[styles.badge, { backgroundColor: "#d1fae5" }]}>
                      <Text style={[styles.badgeText, { color: "#047857" }]}>
                        Checked in
                      </Text>
                    </View>
                  ) : tab === "upcoming" ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.brandLight }]}>
                      <Text style={[styles.badgeText, { color: theme.colors.brand }]}>
                        Tap to view QR
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: "#f1f5f9" }]}>
                      <Text style={[styles.badgeText, { color: theme.colors.muted }]}>
                        Did not check in
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        active && { backgroundColor: theme.colors.brand },
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.tabText,
          active && { color: "#fff", fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    padding: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  heading: {
    fontSize: theme.font.xxl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: theme.colors.bg,
    padding: 4,
    borderRadius: theme.radius.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  tabText: { color: theme.colors.muted, fontWeight: "500" },
  content: { padding: 20, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: {
    fontSize: theme.font.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cardMeta: {
    fontSize: theme.font.sm,
    color: theme.colors.muted,
    marginTop: 2,
  },
  cardFooter: { marginTop: 10, flexDirection: "row" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: theme.font.xs, fontWeight: "600" },
  empty: { padding: 40, alignItems: "center" },
  emptyTitle: {
    fontSize: theme.font.lg,
    fontWeight: "600",
    color: theme.colors.text,
  },
  emptyBody: {
    textAlign: "center",
    color: theme.colors.muted,
    marginTop: 4,
  },
});
