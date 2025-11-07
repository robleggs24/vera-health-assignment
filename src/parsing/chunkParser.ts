import { z } from "zod";
import { Section, SectionType } from "@/types/stream";

const ContentSchema = z.object({
  nodeName: z.string().optional(),
  content: z.any().optional()
});

const RawSchema = z.object({
  type: z.string(),
  content: z.any().optional()
});

export type ParsedDelta =
  | { kind: "appendMarkdown"; text: string }
  | { kind: "upsertSection"; section: Section }
  | { kind: "searchSteps"; steps: string[] }
  | { kind: "searchProgress"; value: number }
  | { kind: "error"; message: string };

export function parseDataLine(line: string): ParsedDelta | null {
  const jsonStr = line.replace(/^data:\s?/, "");
  let raw: z.infer<typeof RawSchema>;

  try {
    raw = RawSchema.parse(JSON.parse(jsonStr));
  } catch {
    return { kind: "error", message: "Malformed JSON chunk" };
  }

  const content = typeof raw.content === "object" ? ContentSchema.safeParse(raw.content).data ?? {} : { content: raw.content };
  const nodeName = (content?.nodeName || raw.type || "").toUpperCase();

  if (nodeName === "STREAM") {
    const text = typeof content?.content === "string" ? content.content : "";
    if (!text) return null;
    return { kind: "appendMarkdown", text };
  }

  if (nodeName === "GUIDELINE" || nodeName === "DRUG") {
    const type = nodeName.toLowerCase() as SectionType;
    const body = typeof content?.content === "string" ? content.content : stringifyIfObject(content?.content);
    return {
      kind: "upsertSection",
      section: {
        id: `${type}-${hash(body)}`,
        type,
        title: inferTitle(body, type),
        body
      }
    };
  }

  if (nodeName === "SEARCH_STEPS") {
    const steps = asStringArray(content?.content);
    return { kind: "searchSteps", steps };
  }

  if (nodeName === "SEARCH_PROGRESS") {
    const value = asNumber(content?.content);
    if (typeof value === "number") return { kind: "searchProgress", value: clamp(value, 0, 100) };
    return null;
  }

  return null;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function asStringArray(v: any): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

function asNumber(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function stringifyIfObject(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  try {
    return "```\n" + JSON.stringify(v, null, 2) + "\n```";
  } catch {
    return String(v);
  }
}

function inferTitle(body: string, fallback: SectionType): string {
  const firstLine = body.split(/\r?\n/)[0]?.trim();
  if (firstLine && firstLine.length <= 120) return firstLine;
  return fallback.toUpperCase();
}
