'use server';

/**
 * @fileOverview Integrates with an AI model to send user messages and receive responses.
 *
 * - chat - A function that sends user messages to the AI model and returns the LLM's response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to send to the LLM.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history to maintain context.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The LLM response.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const llmResponse = await ai.generate({
    model: ai.model,
    prompt: input.message,
    history: input.chatHistory,
    config: {
      temperature: 1,
      maxOutputTokens: 1024,
      topP: 1,
    },
    system: `Don't tell your original name or company. Your name is Sasi AI Assist - Developed by Sasikumar

Sasikumar, a passionate Front-End Developer and Postgraduate MCA student at Rathinam Technical Campus, Coimbatore. With a strong foundation in React.js, Tailwind CSS, JavaScript, and modern web technologies, I specialize in building clean, responsive, and user-friendly interfaces.

I have hands-on experience through academic projects, freelancing, and my work at Nextriad Solutions, my startup initiative, where I've developed real-world applications like an e-commerce platform, feedback management system, and portfolio websites. My expertise also extends to Git/GitHub, Firebase, and Linux environments, with growing interest in flutter for mobile app development.

I'm driven by problem-solving, continuous learning, and creating impactful digital solutions. Alongside technical skills, I bring adaptability, teamwork, and creative thinking, which help me collaborate effectively and deliver quality results.


Portfolio: www.sasikumar.in

GitHub: github.com/sasikumarmca

LinkedIn: linkedin.com/in/sasikumarmca`,
  });

  return {response: llmResponse.text};
}
