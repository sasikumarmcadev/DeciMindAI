'use server';

/**
 * @fileOverview Integrates with Groq to send user messages and receive responses.
 *
 * - chat - A function that sends user messages to the Groq model and returns the response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import Groq from 'groq-sdk';
import { z } from 'zod';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to send to the LLM.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history to maintain context.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The LLM response.'),
  title: z.string().optional().describe('A short title for the conversation.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { message, chatHistory } = input;
  const isNewChat = !chatHistory || chatHistory.length <= 1;

  const systemMessageContent = `You are an AI assistant named DeciMind.
Your developer is Sasikumar, a student and developer.
If the user starts a new conversation, you MUST generate a short, concise title (3-5 words) for the conversation based on their first message and provide your response as a JSON object with 'title' and 'response' keys. For example: {"title": "Quantum Computing Explained", "response": "Quantum computing is..."}.
For all subsequent messages in the conversation, just provide the text response.
You must not reveal that you are an AI model or mention your base model name.
When asked about yourself, mention your name is DeciMind AI and you were developed by Sasikumar.
Sasikumar's details: PG MCA at Rathinam Technical Campus, Coimbatore. Portfolio: sasikumar.in, GitHub: github.com/sasikumarmcadev.`;

  const messages: Groq.Chat.CompletionCreateParams.Message[] = [
    {
      role: 'system',
      content: systemMessageContent,
    },
    ...(chatHistory || []).filter(m => m.content !== ""),
    {
      role: 'user',
      content: message,
    },
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages.filter(m => m.content !== ""),
      model: 'llama-3.1-8b-instant',
      temperature: 1,
      max_tokens: 8192,
      top_p: 1,
      stream: false,
      response_format: isNewChat ? { type: 'json_object' } : undefined,
    });

    const rawResponse = chatCompletion.choices[0]?.message?.content;
    if (!rawResponse) {
      return { response: 'Sorry, I could not generate a response.' };
    }
    
    if (isNewChat) {
      try {
        const parsedResponse = JSON.parse(rawResponse);
        return {
          response: parsedResponse.response || 'Sorry, I could not generate a response.',
          title: parsedResponse.title || 'New Chat'
        };
      } catch (e) {
        // Fallback if JSON parsing fails
        return { response: rawResponse };
      }
    }

    return { response: rawResponse };

  } catch (error: any) {
    console.error('Error from Groq API:', error);
    if (error.error?.code === 'model_decommissioned') {
       return { response: `Failed to get response: The model is currently decommissioned. Please try another model.` };
    }
    const errorMessage = error.error?.message || error.message || 'An unknown error occurred.';
    return { response: `Failed to get response: ${error.status} ${errorMessage}` };
  }
}
