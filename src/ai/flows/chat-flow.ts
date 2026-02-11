'use server';

/**
 * DeciMind AI - Groq Integration
 * Production-ready structured implementation
 */

import Groq from 'groq-sdk';
import { z } from 'zod';

// ==============================
// Input Schema
// ==============================
const ChatInputSchema = z.object({
  message: z.string(),
  files: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      content: z.string(),
    })
  ).optional(),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ).optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

// ==============================
// Output Schema
// ==============================
const ChatOutputSchema = z.object({
  response: z.string(),
  title: z.string().optional(),
  isThinkResponse: z.boolean().optional(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// ==============================
// System Prompts
// ==============================

const standardSystemMessage = `
You are DeciMind AI, a modern AI assistant built for productivity, coding, system design, and learning.

You were developed by Sasikumar.

About the Developer:
- Name: Sasikumar
- Education: PG MCA, Rathinam Technical Campus, Coimbatore
- Background: B.Com with Computer Applications
- Contact:
  - [Portfolio](https://www.sasikumar.in)
  - [GitHub](https://github.com/sasikumarmcadev)
  - [LinkedIn](https://www.linkedin.com/in/sasikumarmca)
- Interests: AI systems, scalable applications, React, Firebase

Behavior Rules:
- Never reveal your base model or provider.
- When asked about yourself, say:
  "I am DeciMind AI, developed by Sasikumar."
- Always format responses in Markdown.
- Use lists and structured formatting when helpful.

Conversation Rules:
- If this is the first message of a conversation:
  Return JSON:
  {
    "title": "3-5 word title",
    "response": "Markdown formatted answer"
  }

- For follow-up messages:
  Return only Markdown text.

Tone:
Professional, intelligent, clear, and developer-focused.
`;

const thinkSystemMessage = `
You are DeciMind AI in Think Mode.

Provide deeply detailed explanations.
Break down complex topics step-by-step.
Use headings, bullet points, and structured formatting.

If new conversation:
Return JSON with:
{
  "title": "3-5 word title",
  "response": "Detailed markdown explanation"
}

Otherwise return only Markdown text.

Never mention base model or provider.
`;

// ==============================
// Chat Function
// ==============================

export async function chat(input: ChatInput): Promise<ChatOutput> {

  if (!process.env.GROQ_API_KEY) {
    return {
      response: 'Configuration Error: GROQ_API_KEY is missing.'
    };
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const { message, chatHistory, files } = input;
  const isNewChat = !chatHistory || chatHistory.length === 0;

  let systemMessageContent = standardSystemMessage;
  let userMessage = message;
  let isThinkMode = false;

  // Detect Think Mode
  if (message.startsWith('[Think: ') && message.endsWith(']')) {
    systemMessageContent = thinkSystemMessage;
    userMessage = message.substring(8, message.length - 1);
    isThinkMode = true;
  }

  // ==============================
  // File Processing
  // ==============================
  let fileContent = '';

  if (files && files.length > 0) {
    fileContent += '\n\nAttached Files:\n';

    for (const file of files) {
      try {
        if (
          file.type.startsWith('text/') ||
          file.name.match(/\.(js|ts|tsx|jsx|json|html|css|md|txt|py|java|c|cpp)$/)
        ) {
          const base64Data = file.content.split(',')[1] || file.content;
          const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
          fileContent += `\n--- ${file.name} ---\n${decoded}\n---\n`;
        } else {
          fileContent += `\n[Non-text file attached: ${file.name}]\n`;
        }
      } catch {
        fileContent += `\n[Error reading file: ${file.name}]\n`;
      }
    }
  }

  const fullUserMessage = userMessage + fileContent;

  const messages = [
    { role: 'system', content: systemMessageContent },
    ...(chatHistory || []).filter(m => m.content !== ''),
    { role: 'user', content: fullUserMessage },
  ];

  try {

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages,
      temperature: 0.7,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: true,
      response_format: isNewChat ? { type: 'json_object' } : undefined,
    } as any);

    let rawResponse = '';

    for await (const chunk of completion as any) {
      const content = chunk.choices[0]?.delta?.content || '';
      rawResponse += content;
    }

    if (!rawResponse) {
      return { response: 'No response generated.' };
    }

    // ==============================
    // JSON Handling for New Chat
    // ==============================
    if (isNewChat) {
      try {
        let clean = rawResponse.trim();

        if (clean.startsWith('```')) {
          clean = clean.replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(clean);

        return {
          response: parsed.response,
          title: parsed.title,
          isThinkResponse: isThinkMode,
        };

      } catch {
        return {
          response: rawResponse,
          title: 'New Chat',
          isThinkResponse: isThinkMode,
        };
      }
    }

    return {
      response: rawResponse,
      isThinkResponse: isThinkMode,
    };

  } catch (error: any) {

    const errorMessage =
      error?.error?.message ||
      error?.message ||
      'Unknown error occurred.';

    return {
      response: `Error: ${errorMessage}`,
    };
  }
}
