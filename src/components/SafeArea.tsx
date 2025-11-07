import React from "react";
import { Platform, SafeAreaView, View, StyleSheet } from "react-native";

export const SafeArea: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (Platform.OS === "android") {
    return <View style={styles.android}>{children}</View>;
  }
  return <SafeAreaView style={styles.ios}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  ios: { flex: 1, backgroundColor: "#fff" },
  android: { flex: 1, paddingTop: 28, backgroundColor: "#fff" }
});
