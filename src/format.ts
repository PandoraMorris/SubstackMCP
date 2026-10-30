// Conversions between Markdown, Substack's ProseMirror document JSON, and plain text.

type Mark = { type: string; attrs?: Record<string, unknown> };
type PMNode = { type: string; attrs?: Record<string, unknown>; content?: PMNode[]; text?: string; marks?: Mark[] };

/** Markdown -> Substack ProseMirror doc. Covers headings, paragraphs, lists, quotes, code, rules, images and inline marks. */
export function markdownToDoc(md: string): PMNode {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const content: PMNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      content.push({
        type: "code_block",
        attrs: fence[1] ? { language: fence[1] } : {},
        content: code.length ? [{ type: "text", text: code.join("\n") }] : undefined,
      });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      content.push({ type: "heading", attrs: { level: heading[1].length }, content: inline(heading[2]) });
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      content.push({ type: "horizontal_rule" });
      i++;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/);
    if (image) {
      content.push({
        type: "captionedImage",
        content: [{ type: "image2", attrs: { src: image[2], alt: image[1] || null } }],
      });
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) quoted.push(lines[i++].replace(/^>\s?/, ""));
      content.push({ type: "blockquote", content: markdownToDoc(quoted.join("\n")).content });
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*+]|\d+[.)])\s+/);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2]);
      const items: PMNode[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
        if (!m || /\d/.test(m[1]) !== ordered) break;
        items.push({ type: "list_item", content: [{ type: "paragraph", content: inline(m[2]) }] });
        i++;
      }
      content.push({ type: ordered ? "ordered_list" : "bullet_list", content: items });
      continue;
    }

    // Paragraph: gather consecutive plain lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|```|>|\s*([-*+]|\d+[.)])\s|!\[)/.test(lines[i]) &&
      !/^\s*([-*_])(\s*\1){2,}\s*$/.test(lines[i])
    ) {
      para.push(lines[i++].trim());
    }
    content.push({ type: "paragraph", content: inline(para.join(" ")) });
  }

  return { type: "doc", content };
}

/** Inline Markdown -> text nodes with strong/em/code/link marks. */
function inline(text: string, marks: Mark[] = []): PMNode[] | undefined {
  const nodes: PMNode[] = [];
  const pattern = /(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*]+)\*|_([^_]+)_)/;
  let rest = text;

  while (rest) {
    const m = rest.match(pattern);
    if (!m || m.index === undefined) {
      nodes.push(textNode(rest, marks));
      break;
    }
    if (m.index > 0) nodes.push(textNode(rest.slice(0, m.index), marks));

    if (m[1]) nodes.push(textNode(m[2], [...marks, { type: "code" }]));
    else if (m[3]) nodes.push(...(inline(m[4], [...marks, { type: "link", attrs: { href: m[5] } }]) ?? []));
    else if (m[6]) nodes.push(...(inline(m[7] ?? m[8], [...marks, { type: "strong" }]) ?? []));
    else if (m[9]) nodes.push(...(inline(m[10] ?? m[11], [...marks, { type: "em" }]) ?? []));

    rest = rest.slice(m.index + m[0].length);
  }

  const filtered = nodes.filter((n) => n.text);
  return filtered.length ? filtered : undefined;
}

function textNode(text: string, marks: Mark[]): PMNode {
  return marks.length ? { type: "text", text, marks } : { type: "text", text };
}

/** Substack ProseMirror doc (object or JSON string) -> Markdown, for reading drafts back. */
export function docToMarkdown(doc: PMNode | string | null | undefined): string {
  if (!doc) return "";
  const root: PMNode = typeof doc === "string" ? JSON.parse(doc) : doc;
  return (root.content ?? []).map((n) => block(n)).filter(Boolean).join("\n\n");
}

function block(n: PMNode, indent = ""): string {
  const text = () => (n.content ?? []).map(inlineToMd).join("");
  switch (n.type) {
    case "heading":
      return `${"#".repeat(Number(n.attrs?.level ?? 1))} ${text()}`;
    case "paragraph":
      return text();
    case "blockquote":
      return (n.content ?? []).map((c) => block(c)).join("\n\n").replace(/^/gm, "> ");
    case "code_block":
      return "```" + (n.attrs?.language ?? "") + "\n" + text() + "\n```";
    case "horizontal_rule":
      return "---";
    case "bullet_list":
    case "ordered_list":
      return (n.content ?? [])
        .map((li, idx) => {
          const bullet = n.type === "ordered_list" ? `${idx + 1}.` : "-";
          return `${indent}${bullet} ${(li.content ?? []).map((c) => block(c, indent + "  ")).join("\n")}`;
        })
        .join("\n");
    case "captionedImage": {
      const img = n.content?.find((c) => c.type === "image2" || c.type === "image");
      return img ? `![${img.attrs?.alt ?? ""}](${img.attrs?.src ?? ""})` : "";
    }
    default:
      return n.content ? (n.content ?? []).map((c) => block(c, indent)).join("\n") : (n.text ?? "");
  }
}

function inlineToMd(n: PMNode): string {
  if (n.type === "hard_break") return "\n";
  if (n.type !== "text") return n.content ? n.content.map(inlineToMd).join("") : "";
  let out = n.text ?? "";
  for (const mark of n.marks ?? []) {
    if (mark.type === "strong") out = `**${out}**`;
    else if (mark.type === "em") out = `*${out}*`;
    else if (mark.type === "code") out = "`" + out + "`";
    else if (mark.type === "link") out = `[${out}](${mark.attrs?.href ?? ""})`;
  }
  return out;
}

/** Published post HTML -> readable plain text with paragraph breaks preserved. */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<(script|style|svg|button)[\s\S]*?<\/\1>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, (fig) => {
      const caption = fig.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
      return `\n\n[Image${caption ? `: ${caption}` : ""}]\n\n`;
    })
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
      const label = inner.replace(/<[^>]+>/g, "").trim();
      return label ? `${label} (${href})` : "";
    })
    .replace(/<h([1-6])[^>]*>/gi, (_, l) => "\n\n" + "#".repeat(Number(l)) + " ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|blockquote|ul|ol|pre|figure)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
