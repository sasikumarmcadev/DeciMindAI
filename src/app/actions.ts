'use server';

import { config } from 'dotenv';
config(); // Load environment variables from .env

import { chat, type ChatInput } from '@/ai/flows/chat-flow';

export async function getDeciMindResponse(
  chatHistory: ChatInput['chatHistory'],
  message: string
) {
  try {
    const result = await chat({
      message,
      chatHistory,
    });
    return { response: result.response, title: result.title, isThinkResponse: result.isThinkResponse };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to get response: ${errorMessage}` };
  }
}
