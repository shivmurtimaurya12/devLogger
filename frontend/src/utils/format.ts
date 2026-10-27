export interface ParsedParagraph {
  text: string;
  note: string | null;
}

// Splits a post body into paragraphs, pulling out @@MARGIN:...@@ blocks
// and attaching them as a note to the paragraph immediately before them.
export function parseBody(body: string): ParsedParagraph[] {
  const blocks = body.split("\n\n");
  const paragraphs: ParsedParagraph[] = [];
  for (const block of blocks) {
    const marginMatch = block.match(/^@@MARGIN:(.*)@@$/s);
    if (marginMatch) {
      if (paragraphs.length > 0) {
        paragraphs[paragraphs.length - 1].note = marginMatch[1].trim();
      }
    } else {
      paragraphs.push({ text: block.trim(), note: null });
    }
  }
  return paragraphs;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function estimateReadingMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 200));
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function excerptFromBody(body: string): string {
  return body
    .trim()
    .split("\n\n")[0]
    .replace(/@@MARGIN:.*?@@/g, "")
    .trim()
    .slice(0, 160);
}
