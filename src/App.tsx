import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeArea } from "./components/SafeArea";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  return (
    <SafeArea>
      <StatusBar style="auto" />
      <HomeScreen />
    </SafeArea>
  );
}
