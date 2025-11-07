export type SectionType = "guideline" | "drug";

export type Section = {
  id: string;
  type: SectionType;
  title?: string;
  body: string;
};

export type StreamState = {
  isStreaming: boolean;
  markdown: string;
  sections: Section[];
  search: {
    steps: string[];
    progress: number | null;
  };
  error?: string;
};

export type StreamAction =
  | { type: "START" }
  | { type: "APPEND_MARKDOWN"; text: string }
  | { type: "UPSERT_SECTION"; section: Section }
  | { type: "SET_STEPS"; steps: string[] }
  | { type: "SET_PROGRESS"; value: number | null }
  | { type: "ERROR"; message: string }
  | { type: "DONE" };
