import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-native-qrcode-svg";
import { format } from "date-fns";
import { api } from "../api/client";
import type { Ticket } from "../api/types";
import { theme } from "../theme";

export default function TicketDetailScreen({ route }: any) {
  const registrationId = route.params.registrationId as string;

  const q = useQuery({
    queryKey: ["ticket", registrationId],
    queryFn: async () =>
      (await api.get<{ ticket: Ticket }>(`/tickets/${registrationId}`)).data
        .ticket,
  });

  if (q.isLoading || !q.data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.muted }}>Loading ticket…</Text>
      </View>
    );
  }

  const { event, registration, token } = q.data;
  const isCheckedIn = !!registration.checkedInAt;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 20, alignItems: "center" }}
    >
      <View style={styles.ticket}>
        <View style={styles.ticketHead}>
          <Text style={styles.eyebrow}>Campus Events · Ticket</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>
            {format(new Date(event.startAt), "EEE, MMM d · h:mm a")}
          </Text>
          <Text style={styles.meta}>{event.venue}</Text>
        </View>

        <View style={styles.perforation} />

        <View style={styles.qrBlock}>
          <View style={styles.qrWrap}>
            <QRCode value={token} size={220} backgroundColor="#fff" />
          </View>
          <Text style={styles.code}>
            {registration.ticketCode.slice(0, 8).toUpperCase()}
          </Text>
          {isCheckedIn ? (
            <View style={styles.checkedIn}>
              <Text style={styles.checkedInText}>
                Checked in ·{" "}
                {format(new Date(registration.checkedInAt!), "MMM d, h:mm a")}
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>Show this at the event entrance</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  ticket: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ticketHead: {
    padding: 20,
    backgroundColor: theme.colors.brand,
  },
  eyebrow: {
    fontSize: theme.font.xs,
    color: "#dbeafe",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: theme.font.xl,
    color: "#fff",
    fontWeight: "700",
    marginTop: 8,
  },
  meta: { color: "#dbeafe", fontSize: theme.font.sm, marginTop: 4 },
  perforation: {
    height: 2,
    borderStyle: "dashed",
    borderTopWidth: 2,
    borderColor: theme.colors.border,
    marginHorizontal: 20,
  },
  qrBlock: { padding: 24, alignItems: "center" },
  qrWrap: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  code: {
    fontFamily: "Courier",
    fontSize: theme.font.lg,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: 4,
    marginTop: 16,
  },
  hint: {
    color: theme.colors.muted,
    marginTop: 10,
    fontSize: theme.font.sm,
  },
  checkedIn: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#d1fae5",
  },
  checkedInText: { color: "#047857", fontWeight: "600", fontSize: theme.font.xs },
});
