import {
  defineModel,
  GenerationUsage,
  ModelAction,
  ModelDefinition,
  Part,
} from 'genkit';
import Groq from 'groq-sdk';
import { z } from 'zod';

const GroqConfigSchema = z.object({
  apiKey: z.string().optional(),
});

type GroqConfig = z.infer<typeof GroqConfigSchema>;

function toGroqMessages(
  history: Part[][]
): Groq.Chat.Completions.ChatCompletionMessageParam[] {
  return history.map((parts) => {
    const content = parts.map((part) => part.text).join('');
    if (parts[0].role === 'assistant') {
      return { role: 'assistant', content };
    }
    return { role: 'user', content };
  });
}

function toGenkitUsage(usage: Groq.CompletionUsage | undefined): GenerationUsage {
  return {
    inputTokens: usage?.prompt_tokens ?? 0,
    outputTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

export function groqModel(
  name: string,
  client: Groq,
  config?: Groq.Chat.Completions.ChatCompletionCreateParams
): ModelDefinition {
  const model: ModelAction = async (request) => {
    const modelId = `groq/${name}`;

    const messages = toGroqMessages(request.history || []);
    if (request.prompt.length > 0) {
      const content = request.prompt.map((part) => part.text).join('');
      messages.push({ role: 'user', content });
    }

    const system = request.system;
    if (system) {
      messages.unshift({ role: 'system', content: system });
    }

    const result = await client.chat.completions.create({
      ...config,
      model: name,
      messages: messages,
      stream: false,
    });

    const choice = result.choices[0];
    if (!choice) {
      throw new Error('No choice returned from Groq API');
    }

    return {
      candidates: [
        {
          index: choice.index,
          finishReason: choice.finish_reason as any,
          message: {
            role: 'assistant',
            content: [{ text: choice.message.content || '' }],
          },
        },
      ],
      usage: toGenkitUsage(result.usage),
    };
  };

  return defineModel(
    {
      name: `groq/${name}`,
      label: `Groq - ${name}`,
      info: {
        provider: 'groq',
        supports: {
          multiturn: true,
          media: false,
          tools: false,
          systemRole: true,
        },
      },
    },
    model
  );
}

export const groq = (config: GroqConfig = {}) => {
  const apiKey = config.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Groq API key is not configured. Pass it to `groq` function or set GROQ_API_KEY environment variable.'
    );
  }
  const client = new Groq({ apiKey });

  return {
    name: 'groq',
    models: [
      groqModel('llama3-70b-8192', client),
      groqModel('llama3-8b-8192', client),
      groqModel('mixtral-8x7b-32768', client),
      groqModel('gemma-7b-it', client),
    ],
  };
};
