'use server';

import { chat, type ChatInput } from '@/ai/flows/chat-flow';

export async function getDeciMindResponse(
  chatHistory: ChatInput['chatHistory'],
  message: string
) {
  try {
    const response = await chat({
      message,
      chatHistory,
    });
    return { response: response.response };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to get response: ${errorMessage}` };
  }
}
