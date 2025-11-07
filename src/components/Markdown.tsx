import React from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import Markdown, { MarkdownProps } from "react-native-markdown-display";

const FadeInMarkdown: React.FC<MarkdownProps> = ({ children }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, [children]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Markdown style={styles as any}>
        {typeof children === "string" ? children : ""}
      </Markdown>
    </Animated.View>
  );
};

const baseFont = Platform.select({ ios: "System", android: "sans-serif" });

const styles = StyleSheet.create({
  body: { color: "#111827", fontFamily: baseFont, fontSize: 16, lineHeight: 22 },
  heading1: { fontSize: 24, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  heading2: { fontSize: 20, fontWeight: "700", marginTop: 14, marginBottom: 6 },
  code_block: {
    backgroundColor: "#f6f8fa",
    padding: 10,
    borderRadius: 8,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" })
  },
  bullet_list: { marginVertical: 6 },
  ordered_list: { marginVertical: 6 },
  list_item: { marginVertical: 2 },
  link: { color: "#2563eb" }
});

export default FadeInMarkdown;
