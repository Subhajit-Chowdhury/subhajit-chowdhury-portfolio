export interface AssistantResponse {
  answer: string;
  sources?: { id: string; source: string }[];
  error?: string;
}

const ASSISTANT_API_URL = import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:4000';

export async function queryAssistant(question: string): Promise<AssistantResponse> {
  const response = await fetch(`${ASSISTANT_API_URL}/api/assistant/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return {
      answer:
        payload?.error || 'The assistant API returned an error. Please check the backend or your network connection.',
      error: payload?.error || 'Assistant API error',
    };
  }

  return (await response.json()) as AssistantResponse;
}

export function getAssistantApiUrl(): string {
  return ASSISTANT_API_URL;
}
