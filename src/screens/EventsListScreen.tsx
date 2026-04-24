import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "../api/client";
import type { Category, EventItem } from "../api/types";
import { theme } from "../theme";

export default function EventsListScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState<string | null>(null);

  const eventsQ = useQuery({
    queryKey: ["events", search, catId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (catId) params.category = catId;
      const res = await api.get<{ events: EventItem[] }>("/events", { params });
      return res.data.events;
    },
  });

  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await api.get<{ categories: Category[] }>("/categories")).data.categories,
  });

  const events = eventsQ.data ?? [];
  const cats = catsQ.data ?? [];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.heading}>Campus events</Text>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search events, venues…"
          placeholderTextColor={theme.colors.subtle}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip label="All" active={!catId} onPress={() => setCatId(null)} />
          {cats.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={catId === c.id}
              onPress={() => setCatId(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={eventsQ.isFetching}
            onRefresh={() => eventsQ.refetch()}
          />
        }
        ListEmptyComponent={
          !eventsQ.isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptyBody}>
                Try a different search or clear filters.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() =>
              navigation.navigate("EventDetail", { id: item.id })
            }
          />
        )}
      />
    </View>
  );
}

function Chip({
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
      activeOpacity={0.8}
      style={[
        styles.chip,
        active && { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
      ]}
    >
      <Text style={[styles.chipText, active && { color: "#fff" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EventCard({
  event,
  onPress,
}: {
  event: EventItem;
  onPress: () => void;
}) {
  const filled = event.registeredCount ?? 0;
  const pct = Math.min(100, Math.round((filled / event.capacity) * 100));
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {event.posterUrl ? (
        <Image source={{ uri: event.posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterFallback]}>
          <Text style={styles.posterFallbackText}>
            {event.title[0]?.toUpperCase()}
          </Text>
        </View>
      )}
      <View style={{ flex: 1, padding: 14 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.cardMeta}>
          {format(new Date(event.startAt), "EEE, MMM d · h:mm a")}
        </Text>
        <Text style={styles.cardMeta}>{event.venue}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.cardCount}>
            {filled}/{event.capacity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
  search: {
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 14,
    fontSize: theme.font.base,
    color: theme.colors.text,
  },
  chips: { gap: 8, paddingVertical: 10, paddingRight: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  chipText: { color: theme.colors.text, fontSize: theme.font.sm, fontWeight: "500" },
  listContent: { padding: 20, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  poster: {
    width: "100%",
    height: 160,
    backgroundColor: theme.colors.border,
  },
  posterFallback: {
    backgroundColor: theme.colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  posterFallbackText: {
    fontSize: 48,
    color: theme.colors.brand,
    fontWeight: "700",
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: theme.colors.brand },
  cardCount: { fontSize: theme.font.xs, color: theme.colors.muted },
  empty: { padding: 40, alignItems: "center" },
  emptyTitle: {
    fontSize: theme.font.lg,
    fontWeight: "600",
    color: theme.colors.text,
  },
  emptyBody: {
    fontSize: theme.font.sm,
    color: theme.colors.muted,
    marginTop: 4,
    textAlign: "center",
  },
});
