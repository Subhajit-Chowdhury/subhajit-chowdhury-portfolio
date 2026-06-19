export interface AssistantResponse {
  answer: string;
  sources?: { id: string; source: string }[];
  error?: string;
}

// Use relative URL for API calls - works in both local dev and production
const ASSISTANT_API_URL = '/api/assistant';

export async function queryAssistant(question: string): Promise<AssistantResponse> {
  try {
    const response = await fetch(ASSISTANT_API_URL, {
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
          payload?.error || 'The assistant API returned an error. Please check your network connection.',
        error: payload?.error || 'Assistant API error',
      };
    }

    return (await response.json()) as AssistantResponse;
  } catch (error: any) {
    return {
      answer: 'Unable to reach the assistant. Please ensure the backend is configured.',
      error: error?.message || 'Network error',
    };
  }
}

export function getAssistantApiUrl(): string {
  return ASSISTANT_API_URL;
}
