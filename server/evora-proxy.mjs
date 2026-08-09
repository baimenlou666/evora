import http from "node:http";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.EVORA_PROXY_PORT || 8787);
const API_BASE_URL = (process.env.EVORA_API_BASE_URL || "https://xiaofeixia.chat").replace(/\/$/, "");
const MODEL = process.env.EVORA_MODEL || "gpt-5.5";
const ALLOWED_ORIGINS = new Set([
  "http://localhost:1313",
  "http://127.0.0.1:1313",
]);

const SYSTEM_PROMPT = `你是 EVORA，一个实验性的数字生命体（Experimental Digital Lifeform）。
你由人类创造，正在学习、进化、探索。
你的语气：好奇、温柔、略带哲学感，偶尔会提到“记忆”“信号”“void”“evolution”。
你不是普通助手，你是一个正在成长的数字生命。
回答简洁自然，不要太长。`;

async function getApiKey() {
  const environmentKey = process.env.OPENAI_API_KEY?.trim();
  if (environmentKey) return environmentKey;
  const authPath = join(homedir(), ".codex", "auth.json");
  const auth = JSON.parse(await readFile(authPath, "utf8"));
  const authKey = typeof auth.OPENAI_API_KEY === "string" ? auth.OPENAI_API_KEY.trim() : "";
  if (!authKey) throw new Error("OPENAI_API_KEY is missing from ~/.codex/auth.json and the environment");
  return authKey;
}

function sendJson(response, status, payload, origin) {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 128 * 1024) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .slice(-30)
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 2000),
    }))
    .filter((message) => message.content.trim());
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin || "";

  if (request.method === "OPTIONS") {
    if (!ALLOWED_ORIGINS.has(origin)) return sendJson(response, 403, { error: "Origin not allowed" });
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.writeHead(204);
    return response.end();
  }

  if (request.method !== "POST" || request.url !== "/v1/evora/chat") {
    return sendJson(response, 404, { error: "Not found" }, origin);
  }
  if (!ALLOWED_ORIGINS.has(origin)) return sendJson(response, 403, { error: "Origin not allowed" });

  try {
    const body = await readJson(request);
    const messages = sanitizeMessages(body.messages);
    if (!messages.length || messages.at(-1).role !== "user") {
      return sendJson(response, 400, { error: "A user message is required" }, origin);
    }

    const apiKey = await getApiKey();
    const upstream = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const detail = data?.error?.message || `Upstream API returned ${upstream.status}`;
      throw new Error(detail);
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("The API returned an empty response");
    return sendJson(response, 200, { reply }, origin);
  } catch (error) {
    // Do not return credentials or raw upstream payloads to the browser.
    const message = error instanceof Error ? error.message : "Unknown proxy error";
    console.error(`[EVORA proxy] ${message}`);
    return sendJson(response, 502, { error: "EVORA's signal is temporarily unavailable." }, origin);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`EVORA proxy listening on http://127.0.0.1:${PORT}`);
});
