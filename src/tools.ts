import { currentUserId, publicationBase, substackFetch, type Env } from "./substack";
import { docToMarkdown, htmlToText, markdownToDoc } from "./format";

interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  run(args: any, env: Env): Promise<unknown>;
}

const READ_ONLY = { readOnlyHint: true, openWorldHint: true };
const AUDIENCES = ["everyone", "only_paid", "founding", "only_free"];

function summarizePost(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle || undefined,
    date: p.post_date,
    audience: p.audience,
    type: p.type,
    url: p.canonical_url,
    reactions: p.reaction_count,
    comments: p.comment_count,
  };
}

function clampLimit(limit: unknown, fallback = 12): number {
  const n = Number(limit ?? fallback);
  return Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 1), 50) : fallback;
}

export const tools: Tool[] = [
  {
    name: "list_posts",
    description: "List published posts from the publication's archive, newest first by default.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 50, default: 12 },
        offset: { type: "integer", minimum: 0, default: 0 },
        sort: { type: "string", enum: ["new", "top"], default: "new" },
      },
    },
    annotations: READ_ONLY,
    async run({ limit, offset = 0, sort = "new" }, env) {
      const q = new URLSearchParams({ sort, offset: String(offset), limit: String(clampLimit(limit)) });
      const posts = await substackFetch(env, `/api/v1/archive?${q}`);
      return (posts ?? []).map(summarizePost);
    },
  },
  {
    name: "search_posts",
    description: "Search the publication's published posts by keyword.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search terms" },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 12 },
      },
      required: ["query"],
    },
    annotations: READ_ONLY,
    async run({ query, limit }, env) {
      const q = new URLSearchParams({ sort: "new", search: String(query), offset: "0", limit: String(clampLimit(limit)) });
      const posts = await substackFetch(env, `/api/v1/archive?${q}`);
      return (posts ?? []).map(summarizePost);
    },
  },
  {
    name: "get_post",
    description:
      "Get a published post's full text by slug (the last part of its URL, e.g. 'my-post' from /p/my-post). " +
      "Paywalled posts return only the free preview unless the server's cookie belongs to a subscriber or editor.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
    annotations: READ_ONLY,
    async run({ slug }, env) {
      const clean = String(slug).replace(/^.*\/p\//, "").replace(/[/?#].*$/, "");
      const post = await substackFetch(env, `/api/v1/posts/${encodeURIComponent(clean)}`, {
        auth: Boolean(env.SUBSTACK_COOKIE),
      });
      return { ...summarizePost(post), description: post.description, body: htmlToText(post.body_html) };
    },
  },
  {
    name: "list_drafts",
    description: "List unpublished drafts for the publication. Requires the server's Substack session cookie.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 50, default: 25 },
        offset: { type: "integer", minimum: 0, default: 0 },
      },
    },
    annotations: READ_ONLY,
    async run({ limit, offset = 0 }, env) {
      const q = new URLSearchParams({
        offset: String(offset),
        limit: String(clampLimit(limit, 25)),
        order_by: "draft_updated_at",
        order_direction: "desc",
      });
      const res = await substackFetch(env, `/api/v1/post_management/drafts?${q}`, { auth: true });
      return (res?.posts ?? res ?? []).map((d: any) => ({
        id: d.id,
        title: d.draft_title || "(untitled)",
        subtitle: d.draft_subtitle || undefined,
        audience: d.audience,
        updated: d.draft_updated_at,
        editUrl: `${publicationBase(env)}/publish/post/${d.id}`,
      }));
    },
  },
  {
    name: "get_draft",
    description: "Get one draft's title, subtitle and body (as Markdown). Requires the server's Substack session cookie.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "integer", description: "Draft id from list_drafts" } },
      required: ["id"],
    },
    annotations: READ_ONLY,
    async run({ id }, env) {
      const d = await substackFetch(env, `/api/v1/drafts/${Number(id)}`, { auth: true });
      return {
        id: d.id,
        title: d.draft_title,
        subtitle: d.draft_subtitle,
        audience: d.audience,
        updated: d.draft_updated_at,
        editUrl: `${publicationBase(env)}/publish/post/${d.id}`,
        body: docToMarkdown(d.draft_body),
      };
    },
  },
  {
    name: "create_draft",
    description:
      "Create a new draft from Markdown. It is NOT published or emailed: a person reviews it and presses Publish in Substack. " +
      "Supports headings, paragraphs, bold/italic/code, links, lists, blockquotes, code blocks, horizontal rules and image URLs.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        body_markdown: { type: "string", description: "Post body in Markdown (do not repeat the title)" },
        audience: { type: "string", enum: AUDIENCES, default: "everyone" },
      },
      required: ["title", "body_markdown"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    async run({ title, subtitle = "", body_markdown, audience = "everyone" }, env) {
      if (!AUDIENCES.includes(audience)) throw new Error(`audience must be one of ${AUDIENCES.join(", ")}`);
      const userId = await currentUserId(env);
      const d = await substackFetch(env, "/api/v1/drafts", {
        method: "POST",
        auth: true,
        body: {
          draft_title: title,
          draft_subtitle: subtitle,
          draft_body: JSON.stringify(markdownToDoc(body_markdown)),
          draft_bylines: [{ id: userId, is_guest: false }],
          audience,
          section_chosen: true,
          draft_section_id: null,
          type: "newsletter",
        },
      });
      return {
        id: d.id,
        title: d.draft_title,
        editUrl: `${publicationBase(env)}/publish/post/${d.id}`,
        note: "Draft saved. Open editUrl to review and publish.",
      };
    },
  },
  {
    name: "update_draft",
    description:
      "Update an existing draft's title, subtitle, body (Markdown, replaces the whole body) or audience. " +
      "Only drafts can be edited; this never publishes. Fields you omit are left unchanged.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
        subtitle: { type: "string" },
        body_markdown: { type: "string" },
        audience: { type: "string", enum: AUDIENCES },
      },
      required: ["id"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    async run({ id, title, subtitle, body_markdown, audience }, env) {
      const existing = await substackFetch(env, `/api/v1/drafts/${Number(id)}`, { auth: true });
      if (existing.is_published) {
        throw new Error("That post is already published; edit it in Substack instead. This server only edits drafts.");
      }
      if (audience !== undefined && !AUDIENCES.includes(audience)) {
        throw new Error(`audience must be one of ${AUDIENCES.join(", ")}`);
      }
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.draft_title = title;
      if (subtitle !== undefined) patch.draft_subtitle = subtitle;
      if (body_markdown !== undefined) patch.draft_body = JSON.stringify(markdownToDoc(body_markdown));
      if (audience !== undefined) patch.audience = audience;
      if (!Object.keys(patch).length) throw new Error("Nothing to update: pass title, subtitle, body_markdown or audience.");

      const d = await substackFetch(env, `/api/v1/drafts/${Number(id)}`, { method: "PUT", auth: true, body: patch });
      return {
        id: d.id,
        title: d.draft_title,
        updated: Object.keys(patch),
        editUrl: `${publicationBase(env)}/publish/post/${d.id}`,
      };
    },
  },
];
