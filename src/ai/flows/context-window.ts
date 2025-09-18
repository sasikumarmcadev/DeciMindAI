'use server';

/**
 * @fileOverview Manages the chat context window for the DeciMind application.
 *
 * This file defines a Genkit flow that retains context from the chat history within the limits of the model's context window.
 * It includes an exported function, `manageContextWindow`, which handles the process of managing the context window.
 *
 * @exports manageContextWindow - The function to manage the context window.
 * @exports ManageContextWindowInput - The input type for the manageContextWindow function.
 * @exports ManageContextWindowOutput - The return type for the manageContextWindow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ManageContextWindowInputSchema = z.object({
  message: z.string().describe('The current user message.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history to maintain context.'),
  maxContextLength: z.number().default(1000).describe('The maximum length of the context window.'),
});
export type ManageContextWindowInput = z.infer<typeof ManageContextWindowInputSchema>;

const ManageContextWindowOutputSchema = z.object({
  context: z.string().describe('The context to be sent to the LLM.'),
});
export type ManageContextWindowOutput = z.infer<typeof ManageContextWindowOutputSchema>;

export async function manageContextWindow(input: ManageContextWindowInput): Promise<ManageContextWindowOutput> {
  return manageContextWindowFlow(input);
}

const manageContextWindowFlow = ai.defineFlow(
  {
    name: 'manageContextWindowFlow',
    inputSchema: ManageContextWindowInputSchema,
    outputSchema: ManageContextWindowOutputSchema,
  },
  async input => {
    const {
      message,
      chatHistory = [],
      maxContextLength,
    } = input;

    let context = '';
    if (chatHistory.length > 0) {
      // Build the context string from the chat history
      let contextBuilder = '';
      for (const chatMessage of chatHistory) {
        contextBuilder += `${chatMessage.role}: ${chatMessage.content}\n`;
      }

      // Trim the context if it exceeds the maximum length
      if (contextBuilder.length > maxContextLength) {
        contextBuilder = contextBuilder.substring(contextBuilder.length - maxContextLength);
      }
      context = contextBuilder;
    }

    context += `user: ${message}`;

    return {context};
  }
);
