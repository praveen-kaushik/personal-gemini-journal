import { invokeLLM, type Message } from "./_core/llm";
import { getGeminiApiKey } from "./secretManager";

type SecureRequest = { messages: Message[]; response_format?: unknown };

function textContent(content: Message["content"]) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "text" in content ? content.text ?? "" : "";
  return content.map((part) => typeof part === "string" ? part : "text" in part ? part.text ?? "" : "").join("\n");
}

export async function secureInvokeLLM(request: SecureRequest) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) return invokeLLM(request as Parameters<typeof invokeLLM>[0]);

  const system = request.messages.find(message => message.role === "system");
  const contents = request.messages.filter(message => message.role !== "system").map(message => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: textContent(message.content) }] }));
  const body: Record<string, unknown> = { contents };
  if (system) body.systemInstruction = { parts: [{ text: textContent(system.content) }] };
  if (request.response_format) body.generationConfig = { responseMimeType: "application/json" };

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("") ?? "";
  return { choices: [{ message: { content: text } }] };
}
