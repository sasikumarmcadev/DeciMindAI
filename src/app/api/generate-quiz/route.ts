import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { topic, numberRecord, difficulty } = await req.json();
        const number = numberRecord || 5;
        const diff = difficulty || "medium";

        if (!topic) {
            return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400 });
        }

        if (!process.env.GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "GROQ_API_KEY is missing" }), { status: 500 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `
You are an expert college-level exam question generator.

Generate ${number} multiple choice questions on the topic:
"${topic}"

Difficulty level: ${diff}

Rules:
- Each question must have exactly 4 options.
- Only one option must be correct.
- Make questions clear and academically accurate.
- Avoid duplicate questions.
- Make options realistic (no obvious wrong answers).
- Ensure questions test conceptual understanding, not simple memorization.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": [
        "option A",
        "option B",
        "option C",
        "option D"
      ],
      "correctAnswer": 0,
      "explanation": "short explanation"
    }
  ]
}

Important:
- correctAnswer must be the index (0-3).
- Do NOT include markdown.
- Do NOT include explanation outside JSON.
- Do NOT include extra text.
`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You generate exam questions in strict JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.6,
        });

        const content = response.choices[0].message.content || "{}";

        // Safe JSON parsing
        try {
            const parsed = JSON.parse(content);
            return new Response(JSON.stringify(parsed), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            return new Response(
                JSON.stringify({ error: "Invalid JSON from AI. Try again." }),
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Quiz Generation Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Something went wrong" }),
            { status: 500 }
        );
    }
}
