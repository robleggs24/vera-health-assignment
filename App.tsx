import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { EventSourcePolyfill } from "event-source-polyfill";
import Markdown from "react-native-markdown-display";
import { parseStructured } from "./utils/parseStream";
import Collapsible from "./components/Collapsible";
import CollapsibleSection from "./components/CollapsibleSection";
import SearchProgress from "./components/SearchProgress";

const ENDPOINT = "https://vera-assignment-api.vercel.app/api/stream";

export default function App() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [outside, setOutside] = useState<string>("");
  const [steps, setSteps] = useState<any[]>([]);
  const [rawData, setRawData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const esRef = useRef<EventSourcePolyfill | null>(null);

  const handleStream = () => {
    if (!question.trim()) return;

    // Save the question before clearing
    const currentQuestion = question.trim();
    setSubmittedQuestion(currentQuestion);

    // Clear input immediately (like ChatGPT)
    setQuestion("");

    // Reset states
    setSections([]);
    setOutside("");
    setSteps([]);
    setRawData("");
    setLoading(true);

    // Close previous connection if exists
    if (esRef.current) {
      esRef.current.close();
    }

    const url = `${ENDPOINT}?prompt=${encodeURIComponent(currentQuestion)}`;
    console.log("Connecting to:", url);

    const es = new EventSourcePolyfill(url, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });

    esRef.current = es;

    es.onopen = () => {
      console.log("EventSource connection opened");
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received data type:", data.type, "nodeName:", data.content?.nodeName);

        // Handle SEARCH_STEPS
        if (data.type === "NodeChunk" && data.content?.nodeName === "SEARCH_STEPS") {
          console.log("Search steps:", data.content.content);
          if (Array.isArray(data.content.content)) {
            setSteps(data.content.content);
          }
          return;
        }

        // Handle SEARCH_PROGRESS
        if (data.type === "NodeChunk" && data.content?.nodeName === "SEARCH_PROGRESS") {
          console.log("Search progress");
          return;
        }

        // Handle STREAM content - NEW FORMAT (type: "STREAM")
        if (data.type === "STREAM") {
          const chunk = data.content || "";
          console.log("Stream chunk (new format), length:", chunk.length);
          
          setRawData((prev) => {
            const newData = prev + chunk;
            console.log("Total data:", newData.substring(0, 100) + "...");
            const parsed = parseStructured(newData);
            console.log("Parsed - sections:", parsed.sections.length, "outside:", parsed.outside.length);
            setSections(parsed.sections);
            setOutside(parsed.outside);
            return newData;
          });
          return;
        }

        // Handle STREAM content - OLD FORMAT (NodeChunk with nodeName: "STREAM")
        if (data.type === "NodeChunk" && data.content?.nodeName === "STREAM") {
          const chunk = data.content.content || "";
          console.log("Stream chunk (old format), length:", chunk.length);
          
          setRawData((prev) => {
            const newData = prev + chunk;
            console.log("Total data:", newData.substring(0, 100) + "...");
            const parsed = parseStructured(newData);
            console.log("Parsed - sections:", parsed.sections.length, "outside:", parsed.outside.length);
            setSections(parsed.sections);
            setOutside(parsed.outside);
            return newData;
          });
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    es.onerror = (error) => {
      console.error("EventSource error:", error);
      setLoading(false);
      if (esRef.current) {
        esRef.current.close();
      }
    };

    // Listen for when stream closes naturally
    es.addEventListener("close", () => {
      console.log("Stream closed");
      setLoading(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Vera Health</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask a clinical question..."
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleStream}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Loading..." : "Ask"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Progress - Bonus Feature */}
        {steps.length > 0 && (
          <SearchProgress steps={steps} />
        )}

        {/* Response Section */}
        {(sections.length > 0 || outside || loading) && submittedQuestion && (
          <Collapsible
            title={submittedQuestion}
            defaultExpanded={true}
          >
            <View style={styles.responseContent}>
              {/* Render outside text (before any tags) */}
              {outside && (
                <Markdown style={markdownStyles}>
                  {outside}
                </Markdown>
              )}

              {/* Render collapsible sections for each tag */}
              {sections.map((section, index) => (
                <CollapsibleSection
                  key={`${section.tag}-${index}`}
                  title={section.tag}
                  content={section.content}
                />
              ))}

              {/* Loading indicator */}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
            </View>
          </Collapsible>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E8",
  },
  headerText: {
    color: "#24292E",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
    color: "#000",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  responseContent: {
    padding: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
});

const markdownStyles = {
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },
  strong: {
    fontWeight: "700",
  },
  bullet_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  ordered_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
};