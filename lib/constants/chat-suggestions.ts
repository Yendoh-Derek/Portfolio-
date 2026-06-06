export const DEFAULT_CHAT_SUGGESTIONS = [
  "Tell me about the Edge AI project",
  "What is Derek's ML tech stack?",
  "Is Derek open to remote engineering roles?",
  "Tell me about the DiaTrack project",
] as const;

export function projectChatSuggestions(title: string): string[] {
  return [
    `What problem does ${title} solve?`,
    `Tell me about the architecture of ${title}`,
    `What tech stack powers ${title}?`,
    `What were the key design decisions in ${title}?`,
  ];
}
