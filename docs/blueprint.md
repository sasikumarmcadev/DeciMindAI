# **App Name**: Groq Chat

## Core Features:

- Message Input: A text input field for users to type their messages to the Groq LLM.
- Groq Cloud API Integration: Integrate with the Groq Cloud API to send user messages and receive responses.
- Response Display: Display the Groq LLM's responses in a chat-like interface, with clear differentiation between user and bot messages.
- Streaming Output: Stream the LLM's output to the user, as it becomes available from the API. (The alternative would be to wait for the full response before showing any of it)
- Context Window: Use a tool to retain context from the chat history within the limits of the model's context window, including older messages as part of newer API calls to the LLM.
- Code Highlighting: Automatically detect and format code in the LLM's responses.
- Clear Conversation: Allow users to manually clear the current conversation and start a new one.

## Style Guidelines:

- Primary color: Soft lavender (#E6E6FA) to create a calm and inviting atmosphere.
- Background color: Very light lavender (#F5F5FF). Nearly indistinguishable from white, for a clean, quiet feel.
- Accent color: Muted plum (#917FB3) for subtle visual interest and interaction cues.
- Body and headline font: 'PT Sans', a humanist sans-serif, for readability and a modern look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Simple, minimalist icons for controls like 'clear conversation'.
- Subtle animations for loading states and message transitions.