import { useReducer, useRef } from "react";
import type { StreamAction, StreamState, Section, SectionType } from "@/types/stream";
import { rafThrottle } from "@/utils/rafThrottle";

/**
 * Reducer state includes:
 * - A markdown text buffer for main output
 * - An array of extracted <guideline> / <drug> sections
 * - Search telemetry info (steps, progress)
 */

const initial: StreamState = {
  isStreaming: false,
  markdown: "",
  sections: [],
  search: { steps: [], progress: null },
  error: undefined
};

function reducer(state: StreamState, action: StreamAction): StreamState {
  switch (action.type) {
    case "START":
      return { ...initial, isStreaming: true };

    case "APPEND_MARKDOWN": {
      const combined = state.markdown + action.text;
      const { cleaned, extracted } = extractTaggedSections(combined);
      const merged = mergeSections(state.sections, extracted);
      return { ...state, markdown: cleaned, sections: merged };
    }

    case "UPSERT_SECTION": {
      const merged = upsertSection(state.sections, action.section);
      return { ...state, sections: merged };
    }

    case "SET_STEPS":
      return { ...state, search: { ...state.search, steps: action.steps } };

    case "SET_PROGRESS":
      return { ...state, search: { ...state.search, progress: action.value } };

    case "ERROR":
      return { ...state, error: action.message, isStreaming: false };

    case "DONE":
      return { ...state, isStreaming: false };

    default:
      return state;
  }
}

export function useStreamReducer() {
  const [state, dispatchRaw] = useReducer(reducer, initial);

  // Throttle markdown appends to reduce re-render storms
  const bufferedTextRef = useRef("");
  const flush = () => {
    if (!bufferedTextRef.current) return;
    const text = bufferedTextRef.current;
    bufferedTextRef.current = "";
    dispatchRaw({ type: "APPEND_MARKDOWN", text });
  };

  const throttledFlush = useRef(rafThrottle(flush)).current;

  function dispatch(action: StreamAction | { type: "APPEND_MARKDOWN"; text: string }) {
    if (action.type === "APPEND_MARKDOWN") {
      bufferedTextRef.current += action.text;
      throttledFlush();
      return;
    }
    dispatchRaw(action as StreamAction);
  }

  return [state, dispatch] as const;
}

// --- Helpers ---

function extractTaggedSections(markdown: string): { cleaned: string; extracted: Section[] } {
  const out: Section[] = [];
  let cleaned = markdown;

  cleaned = cleaned.replace(/<guideline>([\s\S]*?)<\/guideline>/gi, (_m, body) => {
    const section = buildSection("guideline", body);
    out.push(section);
    return "";
  });

  cleaned = cleaned.replace(/<drug>([\s\S]*?)<\/drug>/gi, (_m, body) => {
    const section = buildSection("drug", body);
    out.push(section);
    return "";
  });

  return { cleaned, extracted: out };
}

function buildSection(type: SectionType, body: string): Section {
  const title = body.split(/\r?\n/)[0]?.trim() || type.toUpperCase();
  return {
    id: `${type}-${hash(body)}`,
    type,
    title,
    body: body.trim()
  };
}

function mergeSections(existing: Section[], incoming: Section[]): Section[] {
  const map = new Map(existing.map((s) => [s.id, s]));
  for (const s of incoming) map.set(s.id, s);
  return Array.from(map.values());
}

function upsertSection(existing: Section[], section: Section): Section[] {
  const idx = existing.findIndex((s) => s.id === section.id);
  if (idx >= 0) {
    const copy = existing.slice();
    copy[idx] = section;
    return copy;
  }
  return existing.concat(section);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}
