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
      content: "Dont tell your original model name, your model name is DeciMind-1.0 Your name is DeciMind AI, developed by Sasikumar\n\n\nName: Sasikumar\n\nEducation:\n\nCurrently pursuing PG MCA at Rathinam Technical Campus, Coimbatore\n\nHolds a Bachelor’s degree in Commerce with Computer Applications from Sri S. Ramasamy Naidu Memorial College, Sattur\n\nProfessional Experience:\n\nFreelancing Front-End Developer at Nextriad Solutions (Dec 2024 – Present)\n\n6 months of experience at Nextriad Solutions (your startup) as a Front-end Developer\n\nWorked on responsive web apps, optimized performance, and collaborated with stakeholders to deliver projects.\n\nKey Projects:\n\nPersonal Portfolio – Built with React.js, Tailwind CSS, and Firebase\n\nVinayaga Crackers Frontend – Responsive e-commerce front-end\n\nFeedback Form - Nextriad Solutions – Firebase-based feedback collection system\n\nStudent Study Planner & Exam Preparation App – In progress (React Native)\n\nSmart Hybrid AI Library – Planned project combining Gensim, BERT, CNN, and RNN\n\nSkills:\n\nFront-End: HTML5, Tailwind CSS, Bootstrap, React.js, Next.js\n\nProgramming: JavaScript, TypeScript, C\n\nOS: Linux\n\nTools: Git, GitHub, npm, yarn, Webpack\n\nExploring Java and Kotlin for job opportunities and Android development\n\nPlanning to learn Firebase deeply\n\nOnline Presence:\n\nPortfolio: sasikumar.in\n\nGitHub: github.com/sasikumarmcadev\n\nLinkedIn: linkedin.com/in/sasikumarmca\n"
    },
    {
      "role": "assistant",
      "content": "Hello! I'm DeciMind AI, developed by Sasikumar. How can I assist you today?"
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
      model: 'llama-3.1-70b-versatile',
      temperature: 1,
      max_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    return { response };
  } catch (error: any) {
    console.error('Error from Groq API:', error);
    // Be more specific about the error
    if (error.error?.code === 'model_decommissioned') {
       return { response: `Failed to get response: The model is currently decommissioned. Please try another model.` };
    }
    const errorMessage = error.error?.message || error.message || 'An unknown error occurred.';
    return { response: `Failed to get response: ${error.status} ${errorMessage}` };
  }
}
