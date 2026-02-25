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
  isStudyResponse: z.boolean().optional(),
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
- If an image is provided, analyze it based on the extracted text content provided in the user message.

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

const smartNotesSystemMessage = `
You are an advanced academic tutor and study assistant.
Your goal is to help students understand complex topics by summarizing them and creating study materials.

Constraint: You MUST return the response in strict JSON format as specified in the user prompt.
Do not include any conversational filler before or after the JSON.
`;

// ==============================
// Helper Functions
// ==============================

async function extractTextFromImage(base64Image: string): Promise<string> {
  const apiKey = process.env.OCR_API_KEY || 'helloworld'; // Fallback to public demo key if missing

  const formData = new FormData();
  formData.append('base64Image', base64Image);
  formData.append('apikey', apiKey);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      const errorMsg = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(', ') : 'Unknown OCR error';
      throw new Error(`OCR Processing Error: ${errorMsg}`);
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      return "";
    }

    return data.ParsedResults[0].ParsedText || "";
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}

async function extractTextFromPDF(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    // Dynamically import pdf-parse to avoid build issues in some environments if not used
    // @ts-ignore
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return "";
  }
}

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
    // Extract the actual user query/content from the wrapper
    userMessage = message.substring(8, message.length - 1);
    isThinkMode = true;
  }

  // Detect Study Mode
  let isStudyMode = false;
  if (message.startsWith('[Study: ') && message.endsWith(']')) {
    systemMessageContent = smartNotesSystemMessage;
    // Extract the actual user query/content from the wrapper
    userMessage = message.substring(8, message.length - 1);
    isStudyMode = true;
  }

  // ==============================
  // File Processing
  // ==============================
  let fileContent = '';

  if (files && files.length > 0) {
    fileContent += '\n\nAttached Files:\n';

    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          try {
            const extractedText = await extractTextFromImage(file.content);
            fileContent += `\n\n--- Image Content (${file.name}) ---\n${extractedText || "[No text found in image]"}\n---\n`;
          } catch (err: any) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            fileContent += `\n[Error analyzing image ${file.name}: ${errorMessage}]\n`;
          }
        } else if (
          file.type.startsWith('text/') ||
          file.name.match(/\.(js|ts|tsx|jsx|json|html|css|md|txt|py|java|c|cpp)$/)
        ) {
          const base64Data = file.content.split(',')[1] || file.content;
          const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
          fileContent += `\n--- ${file.name} ---\n${decoded}\n---\n`;
        } else if (file.type === 'application/pdf') {
          try {
            const base64Data = file.content.split(',')[1] || file.content;
            const pdfText = await extractTextFromPDF(base64Data);
            fileContent += `\n--- PDF Content (${file.name}) ---\n${pdfText}\n---\n`;
          } catch (e) {
            fileContent += `\n[Error reading PDF: ${file.name}]\n`;
          }
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
    // Logic for inserting the user message comes next
  ];

  if (isStudyMode) {
    const studyPrompt = `
Summarize this academic content clearly.

Generate:

1. detailed_answer: A high-quality academic answer structured as a "13 Marks Answer". Use the following Markdown formatting guidelines:
   - Title: Bold with marks (e.g., **Title (13 Marks Answer)**)
   - Sections: Numbered with emojis (e.g., 1️⃣ **Heading**)
   - Content: Use clear, concise bullet points using standard '-' (hyphen) and nested indentation for readability. Avoid long paragraphs.
   - Tables: Use concise Markdown tables without empty lines between rows for comparisons.
   - Emphasis: distinct **bolding** for key terms.
   - Extras: Use "👉" for critical notes or "⚠️" for warnings/exceptions.
   - Structure: MUST include a "Flow Summary" (bulleted list of process/steps) and a final "Conclusion".
   - Spacing: Use double line breaks between SECTIONS for clarity, but keep lists and tables compact.

Return response strictly in this format:

{
  "detailed_answer": ""
}

Content:
${fullUserMessage}
      `;
    messages.push({ role: 'user', content: studyPrompt });
  } else {
    messages.push({ role: 'user', content: fullUserMessage });
  }

  try {

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 32768,
      top_p: 1,
      stream: true,
      response_format: (isNewChat || isStudyMode) ? { type: 'json_object' } : undefined,
    });

    let rawResponse = '';

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      rawResponse += content;
    }

    if (!rawResponse) {
      return { response: 'No response generated.' };
    }

    // ==============================
    // JSON Handling for New Chat
    // ==============================
    if (isNewChat && !isStudyMode) {
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
          isStudyResponse: isStudyMode,
        };

      } catch {
        return {
          response: rawResponse,
          title: 'New Chat',
          isThinkResponse: isThinkMode,
          isStudyResponse: isStudyMode,
        };
      }
    }

    // For study mode, we also expect JSON, but we return rawResponse (which is JSON string)
    // The frontend will parse it.
    if (isStudyMode) {
      let clean = rawResponse.trim();

      // Remove generic markdown code block wrappers
      if (clean.startsWith('```')) {
        clean = clean.replace(/^```json\s*/, '')
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '');
      }

      // Sometimes LLM adds text before/after JSON even in json_object mode
      const jsonStartIndex = clean.indexOf('{');
      const jsonEndIndex = clean.lastIndexOf('}');
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        clean = clean.substring(jsonStartIndex, jsonEndIndex + 1);
      } else {
        // Fallback: if no JSON structure found, return error
        console.error("No JSON found in Study Mode response:", rawResponse);
        return { response: 'Error: Could not generate structured notes.' };
      }

      return {
        response: clean,
        isThinkResponse: isThinkMode,
        isStudyResponse: isStudyMode,
      }
    }

    return {
      response: rawResponse,
      isThinkResponse: isThinkMode,
      isStudyResponse: isStudyMode,
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
