export function lineSplitter() {
  let carry = "";
  return {
    push(chunk: string): string[] {
      const text = carry + chunk;
      const parts = text.split(/\r?\n/);
      carry = parts.pop() ?? "";
      return parts;
    },
    flush(): string | null {
      const last = carry;
      carry = "";
      return last || null;
    }
  };
}
