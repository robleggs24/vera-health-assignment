export function ensureJSON(value: any): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
