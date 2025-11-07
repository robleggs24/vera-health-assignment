import { ensureJSON } from "@/utils/ensureJSON";

export type SSEController = { abort: () => void };

type OpenSSEArgs = {
  url: string;
  onChunk: (line: string) => void;
  onError: (err: Error) => void;
  onDone: () => void;
};

/**
 * Works in Expo Web + iOS + Android simulators.
 * Reads from the stream incrementally and emits "data:" lines.
 */
export async function openSSE({ url, onChunk, onError, onDone }: OpenSSEArgs): Promise<SSEController> {
  const controller = new AbortController();
  const { signal } = controller;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "text/event-stream" },
      signal
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No stream available");

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.lastIndexOf("\n");
      if (boundary !== -1) {
        const lines = buffer.slice(0, boundary).split(/\r?\n/);
        buffer = buffer.slice(boundary + 1);
        for (const line of lines) {
          if (line.startsWith("data:")) {
            onChunk(line);
          }
        }
      }
    }

    if (buffer.length > 0 && buffer.startsWith("data:")) onChunk(buffer);
    onDone();
  } catch (e: any) {
    if (signal.aborted) onDone();
    else onError(new Error(e?.message ?? ensureJSON(e)));
  }

  return { abort: () => controller.abort() };
}
