import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { api } from "../api/client";
import type { NotificationItem } from "../api/types";
import { theme } from "../theme";

export default function NotificationsScreen() {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      (
        await api.get<{ notifications: NotificationItem[]; unread: number }>(
          "/notifications"
        )
      ).data,
  });

  const markAllM = useMutation({
    mutationFn: async () => (await api.post("/notifications/read-all")).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markM = useMutation({
    mutationFn: async (id: string) =>
      (await api.post(`/notifications/${id}/read`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const list = q.data?.notifications ?? [];
  const unread = q.data?.unread ?? 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.subheading}>
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={() => markAllM.mutate()}>
            <Text style={styles.link}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={(n) => n.id}
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
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyBody}>
                Register for events and organizers will be able to message you.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => !item.readAt && markM.mutate(item.id)}
            style={[
              styles.item,
              !item.readAt && { backgroundColor: theme.colors.brandLight },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </Text>
            </View>
            {!item.readAt && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  heading: {
    fontSize: theme.font.xxl,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subheading: { color: theme.colors.muted, marginTop: 2 },
  link: {
    color: theme.colors.brand,
    fontWeight: "600",
    fontSize: theme.font.sm,
  },
  content: { padding: 20 },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.font.base,
    fontWeight: "700",
    color: theme.colors.text,
  },
  body: {
    fontSize: theme.font.sm,
    color: theme.colors.muted,
    marginTop: 4,
  },
  time: {
    fontSize: theme.font.xs,
    color: theme.colors.subtle,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand,
    marginTop: 6,
  },
  empty: { alignItems: "center", padding: 40 },
  emptyTitle: {
    fontSize: theme.font.lg,
    fontWeight: "600",
    color: theme.colors.text,
  },
  emptyBody: {
    color: theme.colors.muted,
    marginTop: 4,
    textAlign: "center",
  },
});
