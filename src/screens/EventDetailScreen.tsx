import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { api, apiErrorMessage } from "../api/client";
import type { EventItem } from "../api/types";
import { Button } from "../components/Button";
import { theme } from "../theme";

interface DetailResponse {
  event: EventItem;
  alreadyRegistered: boolean;
}

export default function EventDetailScreen({ route, navigation }: any) {
  const id = route.params.id as string;
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["event", id],
    queryFn: async () =>
      (await api.get<DetailResponse>(`/events/${id}`)).data,
  });

  const registerM = useMutation({
    mutationFn: async () =>
      (await api.post(`/events/${id}/register`)).data,
    onSuccess: () => {
      Alert.alert("Registered", "Your ticket is ready in My Tickets.");
      qc.invalidateQueries({ queryKey: ["event", id] });
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
      navigation.navigate("Tickets");
    },
    onError: (e) => Alert.alert("Could not register", apiErrorMessage(e)),
  });

  const unregisterM = useMutation({
    mutationFn: async () =>
      (await api.delete(`/events/${id}/register`)).data,
    onSuccess: () => {
      Alert.alert("Cancelled", "Your registration was removed.");
      qc.invalidateQueries({ queryKey: ["event", id] });
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
    },
    onError: (e) => Alert.alert("Could not cancel", apiErrorMessage(e)),
  });

  if (q.isLoading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.muted }}>Loading…</Text>
      </View>
    );
  }
  if (!q.data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.muted }}>Event not found</Text>
      </View>
    );
  }

  const { event, alreadyRegistered } = q.data;
  const filled = event.registeredCount ?? 0;
  const isFull = filled >= event.capacity;
  const ended = new Date(event.endAt) < new Date();

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      {event.posterUrl ? (
        <Image source={{ uri: event.posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterFallback]}>
          <Text style={styles.posterFallbackText}>
            {event.title[0]?.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {event.category && (
          <Text style={styles.category}>{event.category.name}</Text>
        )}
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>
          {format(new Date(event.startAt), "EEEE, MMM d · h:mm a")}
        </Text>
        <Text style={styles.meta}>{event.venue}</Text>

        <View style={styles.statsRow}>
          <Stat label="Capacity" value={String(event.capacity)} />
          <Stat label="Registered" value={String(filled)} />
          <Stat
            label="Spots left"
            value={String(Math.max(0, event.capacity - filled))}
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{event.description}</Text>

        <View style={{ marginTop: 24 }}>
          {alreadyRegistered ? (
            <>
              <Button
                title="View my ticket"
                onPress={() => navigation.navigate("Tickets")}
              />
              <View style={{ height: 10 }} />
              <Button
                title="Cancel registration"
                variant="secondary"
                loading={unregisterM.isPending}
                onPress={() =>
                  Alert.alert(
                    "Cancel registration?",
                    "You can register again later if seats are available.",
                    [
                      { text: "Keep", style: "cancel" },
                      {
                        text: "Cancel registration",
                        style: "destructive",
                        onPress: () => unregisterM.mutate(),
                      },
                    ]
                  )
                }
              />
            </>
          ) : ended ? (
            <Button title="Event ended" disabled />
          ) : isFull ? (
            <Button title="Event is full" disabled />
          ) : (
            <Button
              title="Register for this event"
              loading={registerM.isPending}
              onPress={() => registerM.mutate()}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  poster: { width: "100%", height: 240, backgroundColor: theme.colors.border },
  posterFallback: {
    backgroundColor: theme.colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  posterFallbackText: { fontSize: 72, color: theme.colors.brand, fontWeight: "700" },
  content: { padding: 20 },
  category: {
    fontSize: theme.font.xs,
    fontWeight: "700",
    color: theme.colors.brand,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: theme.font.xxl,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 6,
  },
  meta: { fontSize: theme.font.base, color: theme.colors.muted, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: theme.font.xl,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.font.xs,
    color: theme.colors.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: theme.font.sm,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: theme.font.base,
    color: theme.colors.text,
    lineHeight: 22,
  },
});
