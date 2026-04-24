import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../store/auth";
import { apiErrorMessage } from "../api/client";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { theme } from "../theme";

export default function LoginScreen({ navigation }: any) {
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role !== "student") {
        Alert.alert(
          "Heads up",
          "This app is optimized for students. Use the web dashboard for organizer or admin access."
        );
      }
    } catch (e) {
      Alert.alert("Sign in failed", apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.brandCircle}>
          <Text style={styles.brandCircleText}>CE</Text>
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to discover campus events</Text>

        <View style={styles.card}>
          <Input
            label="Email"
            placeholder="you@campus.edu"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Sign in" onPress={onLogin} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            New student? <Text style={styles.linkStrong}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Demo: aarav@campus.edu / Student@123
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.brandLight },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  brandCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.brand,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brandCircleText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  title: {
    fontSize: theme.font.xxl,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: theme.radius.lg,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: theme.colors.muted,
    fontSize: theme.font.sm,
  },
  linkStrong: { color: theme.colors.brand, fontWeight: "600" },
  hint: {
    textAlign: "center",
    color: theme.colors.subtle,
    fontSize: theme.font.xs,
    marginTop: 24,
  },
});
