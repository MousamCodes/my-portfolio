/** Tiny cross-component event bus (client only). */
export const OPEN_ASK_AI = "hq:open-ask-ai";

export function openAskAI(prefill?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_ASK_AI, { detail: { prefill } }));
}
