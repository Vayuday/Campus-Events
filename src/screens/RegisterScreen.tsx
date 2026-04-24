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

export default function RegisterScreen({ navigation }: any) {
  const register = useAuth((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRegister() {
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      Alert.alert("Sign up failed", apiErrorMessage(e));
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
        <Text style={styles.title}>Create your student account</Text>
        <Text style={styles.subtitle}>Browse and register for campus events</Text>

        <View style={styles.card}>
          <Input label="Full name" value={name} onChangeText={setName} />
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Create account" onPress={onRegister} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkStrong}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.brandLight },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
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
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: theme.colors.muted,
    fontSize: theme.font.sm,
  },
  linkStrong: { color: theme.colors.brand, fontWeight: "600" },
});
