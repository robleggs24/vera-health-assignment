import React, { useCallback, useRef, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { TextInputBar } from "@/components/TextInputBar";
import Markdown from "@/components/Markdown";
import Accordion from "@/components/Accordion";
import SearchProgress from "@/components/SearchProgress";
import { useStreamReducer } from "@/state/useStreamReducer";
import { openSSE, SSEController } from "@/api/sse";
import { parseDataLine } from "@/parsing/chunkParser";
import { lineSplitter } from "@/parsing/lineSplitter";

const ENDPOINT = "https://vera-assignment-api.vercel.app/api/stream";

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [{ isStreaming, markdown, sections, search, error }, dispatch] = useStreamReducer();
  const sseRef = useRef<SSEController | null>(null);
  const splitterRef = useRef(lineSplitter());

  const handleAsk = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    dispatch({ type: "START" });
    sseRef.current?.abort();
    const url = `${ENDPOINT}?prompt=${encodeURIComponent(input.trim())}`;

    sseRef.current = await openSSE({
      url,
      onChunk: (raw) => {
        const lines = splitterRef.current.push(raw);
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const delta = parseDataLine(line);
          if (!delta) continue;
          switch (delta.kind) {
            case "appendMarkdown":
              dispatch({ type: "APPEND_MARKDOWN", text: delta.text });
              break;
            case "upsertSection":
              dispatch({ type: "UPSERT_SECTION", section: delta.section });
              break;
            case "searchSteps":
              dispatch({ type: "SET_STEPS", steps: delta.steps });
              break;
            case "searchProgress":
              dispatch({ type: "SET_PROGRESS", value: delta.value });
              break;
            case "error":
              dispatch({ type: "ERROR", message: delta.message });
              break;
          }
        }
      },
      onError: (e) => dispatch({ type: "ERROR", message: e?.message ?? "Stream error" }),
      onDone: () => dispatch({ type: "DONE" })
    });
  }, [input, isStreaming, dispatch]);

  const handleStop = useCallback(() => {
    sseRef.current?.abort();
    dispatch({ type: "DONE" });
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <TextInputBar
        value={input}
        onChangeText={setInput}
        onSubmit={handleAsk}
        disabled={isStreaming}
        onStop={isStreaming ? handleStop : undefined}
      />

      {!!search.progress || (search.steps?.length ?? 0) > 0 ? (
        <SearchProgress progress={search.progress} steps={search.steps} />
      ) : null}

      {error ? <Text style={styles.error}>⚠️ {error}</Text> : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {sections.map((s) => (
          <Accordion key={s.id} title={s.title ?? s.type.toUpperCase()} subtitle={s.type} body={s.body} />
        ))}
        {isStreaming && (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Streaming…</Text>
          </View>
        )}
        <Markdown>{markdown}</Markdown>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  loadingText: { opacity: 0.7 },
  error: { color: "#b00020", paddingHorizontal: 16, paddingBottom: 6 }
});
