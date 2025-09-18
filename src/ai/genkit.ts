import {genkit} from 'genkit';
import {groq} from './groq-plugin';

export const ai = genkit({
  plugins: [groq()],
  model: 'groq/llama3-70b-8192',
});
