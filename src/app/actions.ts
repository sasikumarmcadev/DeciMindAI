'use server';

import { groqChat, type GroqChatInput } from '@/ai/flows/groq-integration';

export async function getGroqResponse(
  chatHistory: GroqChatInput['chatHistory'],
  message: string
) {
  try {
    const response = await groqChat({
      message,
      chatHistory,
    });
    return { response: response.response };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to get response from Groq: ${errorMessage}` };
  }
}
