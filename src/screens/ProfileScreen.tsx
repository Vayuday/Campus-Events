import { Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../store/auth";
import { Button } from "../components/Button";
import { theme } from "../theme";

export default function ProfileScreen() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <View style={styles.root}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? "?"}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{user?.role}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Sign out"
          variant="secondary"
          onPress={() =>
            Alert.alert("Sign out?", "You'll need to log in again.", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign out", style: "destructive", onPress: () => logout() },
            ])
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, padding: 24, alignItems: "center" },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "700" },
  name: {
    fontSize: theme.font.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 16,
  },
  email: {
    color: theme.colors.muted,
    marginTop: 4,
    fontSize: theme.font.base,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.brandLight,
  },
  roleText: {
    fontSize: theme.font.xs,
    color: theme.colors.brand,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actions: { width: "100%", marginTop: 40 },
});
