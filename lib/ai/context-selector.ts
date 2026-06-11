import type { ChatMessage } from "./validation";

const PROJECT_KEYWORDS: Record<string, string[]> = {
  "cascade":        ["cascade", "voice", "latency", "stt", "tts", "deepgram", "groq", "streaming", "pipeline"],
  "diatrack":       ["diatrack", "diabetes", "clinical", "shap", "xgboost", "onnx", "flutter"],
  "edge-ai":        ["edge ai", "tutor", "ghana", "curriculum", "ges", "jhs", "shs", "classroom"],
  "cardiometabolic":["cardiometabolic", "wearable", "ppg", "mimic", "autoencoder", "ssl", "heart"],
  "recommendation": ["recommender", "recommendation", "huggingface", "rag", "semantic", "embedding"],
  "prompt-engineering-framework": ["prompt", "chain-of-thought", "few-shot", "prompting"],
  "about-derek":    ["derek", "background", "education", "knust", "ghana nlp", "raca", "mastercard"],
};

export function selectRelevantDocs(
  userMessage: string,
  conversationHistory: ChatMessage[],
  allDocs: Record<string, string>
): string {
  const query = [
    userMessage,
    ...conversationHistory
      .filter(m => m.role === "user")
      .slice(-2)
      .map(m => m.parts)
  ].join(" ").toLowerCase();

  const selectedDocs: string[] = [];

  for (const [docKey, keywords] of Object.entries(PROJECT_KEYWORDS)) {
    const matches = keywords.filter(kw => query.includes(kw));
    if (matches.length > 0) {
      if (allDocs[docKey]) {
        selectedDocs.push(allDocs[docKey]);
      }
    }
  }

  // Always include a slim version of about-derek for general questions
  if (selectedDocs.length === 0) {
    if (allDocs["about-derek"]) {
      selectedDocs.push(allDocs["about-derek"]);
    }
  }

  return selectedDocs.join("\n\n---\n\n");
}
