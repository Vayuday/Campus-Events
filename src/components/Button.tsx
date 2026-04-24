import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { theme } from "../theme";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const bg =
    variant === "primary"
      ? theme.colors.brand
      : variant === "danger"
        ? theme.colors.danger
        : "#ffffff";
  const color = variant === "secondary" ? theme.colors.text : "#fff";
  const border =
    variant === "secondary" ? { borderWidth: 1, borderColor: theme.colors.border } : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        { backgroundColor: bg, opacity: isDisabled ? 0.6 : 1 },
        border,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.text, { color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: theme.font.base,
    fontWeight: "600",
  },
});
