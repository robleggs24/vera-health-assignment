import React from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
};

export const TextInputBar: React.FC<Props> = ({ value, onChangeText, onSubmit, onStop, disabled }) => {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="Ask a medical question…"
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        onSubmitEditing={onSubmit}
        returnKeyType="send"
      />
      {onStop ? (
        <Pressable style={[styles.btn, styles.stop]} onPress={onStop}>
          <Text style={styles.btnText}>Stop</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.btn, disabled && styles.btnDisabled]} onPress={onSubmit} disabled={disabled}>
          <Text style={styles.btnText}>Ask</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff"
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 12
  },
  btn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827"
  },
  stop: { backgroundColor: "#B00020" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "white", fontWeight: "600" }
});
