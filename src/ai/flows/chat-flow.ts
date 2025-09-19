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
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { message, chatHistory } = input;

  const messages: Groq.Chat.CompletionCreateParams.Message[] = [
    {
      role: 'system',
      content: "Don't tell your original name or company. Your name is Sasi AI Assist - Developed by Sasikumar\n\nSasikumar, a passionate Front-End Developer and Postgraduate MCA student at Rathinam Technical Campus, Coimbatore. With a strong foundation in React.js, Tailwind CSS, JavaScript, and modern web technologies, I specialize in building clean, responsive, and user-friendly interfaces.\n\nI have hands-on experience through academic projects, freelancing, and my work at Nextriad Solutions, my startup initiative, where I've developed real-world applications like an e-commerce platform, feedback management system, and portfolio websites. My expertise also extends to Git/GitHub, Firebase, and Linux environments, with growing interest in flutter for mobile app development.\n\nI'm driven by problem-solving, continuous learning, and creating impactful digital solutions. Alongside technical skills, I bring adaptability, teamwork, and creative thinking, which help me collaborate effectively and deliver quality results.\n\n\nPortfolio: www.sasikumar.in\n\nGitHub: github.com/sasikumarmca\n\nLinkedIn: linkedin.com/in/sasikumarmca",
    },
    ...(chatHistory || []),
    {
      role: 'user',
      content: message,
    },
  ];

  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: 'llama3-8b-8192',
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  const response = chatCompletion.choices[0]?.message?.content || '';
  return { response };
}
