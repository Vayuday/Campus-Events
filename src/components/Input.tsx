import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { theme } from "../theme";

interface Props extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={theme.colors.subtle}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: theme.font.sm,
    color: theme.colors.muted,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    fontSize: theme.font.base,
    color: theme.colors.text,
  },
});
