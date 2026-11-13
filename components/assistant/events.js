export const ASSISTANT_EVENT = "probiz:assistant";

export function openAssistant(prompt) {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT, { detail: { prompt: typeof prompt === "string" ? prompt : null } }));
}
