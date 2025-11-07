import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from "react-native";
import Markdown from "./Markdown";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  title: string;
  subtitle?: string;
  body: string;
};

const Accordion: React.FC<Props> = ({ title, subtitle, body }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.chev}>{open ? "▾" : "▸"}</Text>
      </Pressable>
      {open && (
        <View style={styles.body}>
          <Markdown>{body}</Markdown>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc"
  },
  title: { fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#475569", marginTop: 2, fontSize: 12 },
  chev: { fontSize: 18, width: 20, textAlign: "center", color: "#111827" },
  body: { padding: 14, backgroundColor: "white" }
});

export default Accordion;
