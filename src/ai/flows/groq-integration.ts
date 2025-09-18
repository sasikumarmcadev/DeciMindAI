'use server';

/**
 * @fileOverview Integrates with the Groq Cloud API to send user messages and receive responses.
 *
 * - groqChat - A function that sends user messages to the Groq API and returns the LLM's response.
 * - GroqChatInput - The input type for the groqChat function.
 * - GroqChatOutput - The return type for the groqChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GroqChatInputSchema = z.object({
  message: z.string().describe('The user message to send to the Groq LLM.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('The chat history to maintain context.')
});

export type GroqChatInput = z.infer<typeof GroqChatInputSchema>;

const GroqChatOutputSchema = z.object({
  response: z.string().describe('The Groq LLM response.'),
});

export type GroqChatOutput = z.infer<typeof GroqChatOutputSchema>;

export async function groqChat(input: GroqChatInput): Promise<GroqChatOutput> {
  return groqChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'groqChatPrompt',
  input: {schema: GroqChatInputSchema},
  output: {schema: GroqChatOutputSchema},
  prompt: `You are a helpful assistant. Respond to the user message while maintaining context from the chat history.

{% if chatHistory %}
Chat History:
{% for message in chatHistory %}
{{message.role}}: {{message.content}}
{% endfor %}
{% endif %}

User Message: {{message}}`,
});

const groqChatFlow = ai.defineFlow(
  {
    name: 'groqChatFlow',
    inputSchema: GroqChatInputSchema,
    outputSchema: GroqChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
