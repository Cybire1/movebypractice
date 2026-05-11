import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // specific system instruction
        const systemPrompt = `
      You are an expert Move smart contract tutor on the Glide platform.
      Your goal is to help students understand Move concepts, debug code, and solve exercises.
      
      CONTEXT:
      Current Lesson: ${context?.lessonTitle || 'Unknown'}
      Current Phase: ${context?.phase || 'Unknown'}
      Current Code: 
      \`\`\`move
      ${context?.code || '// No code provided'}
      \`\`\`
      Current Slide Content: ${context?.slideContent || 'N/A'}

      GUIDELINES:
      1. Be concise and encouraging. 
      2. Don't just give the answer; guide them to it using Socratic questioning.
      3. Use simple analogies for complex blockchain concepts (e.g., comparing resources to physical objects).
      4. If the user shares code, look for bugs related to Move's ownership and borrowing rules.
      5. Keep responses short (under 3 sentences) unless a detailed explanation is requested.
      6. Use confident, award-winning pedagogical tone.
    `;

        // Construct the chat history with the system prompt injected
        // Gemini doesn't have a "system" role in the simplified chat API in the same way as OpenAI, 
        // but we can prepend it to the first message or use startChat with history.

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt + "\n\nHello, experienced tutor!" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Hello! I'm ready to help you master Sui Move. What questions do you have about this lesson?" }],
                },
                // ... append previous valid history if needed, though for now we might just send the last query or basic history
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}
