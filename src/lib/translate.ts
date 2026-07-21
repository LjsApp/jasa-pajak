// Module-level cache — persists for the entire browser session
const cache: Record<string, string> = {};

function splitIntoChunks(text: string, maxLen = 480): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    if ((current + " " + word).length > maxLen) {
      if (current) parts.push(current.trim());
      current = word;
    } else {
      current += (current ? " " : "") + word;
    }
  }
  if (current) parts.push(current.trim());
  return parts;
}

export async function translateIdToEn(text: string): Promise<string> {
  if (!text?.trim()) return text || "";
  if (cache[text]) return cache[text];

  try {
    if (text.length > 480) {
      const chunks = splitIntoChunks(text, 480);
      const translated = await Promise.all(chunks.map((c) => translateIdToEn(c)));
      const result = translated.join(" ");
      cache[text] = result;
      return result;
    }

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const result: string = data?.responseData?.translatedText || text;
    cache[text] = result;
    return result;
  } catch {
    return text;
  }
}

/** Strip HTML tags and return plain text */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
