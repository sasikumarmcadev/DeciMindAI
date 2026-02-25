import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { score, total, topic } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "GROQ_API_KEY is missing" }), { status: 500 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const analysisPrompt = `
Student scored ${score}/${total} in quiz on "${topic}".

Analyze performance and suggest:
- Weak areas based on the result
- Study tips specific to this topic
- Next difficulty level recommendation
Return short, highly encouraging, and structured advice for the student.
Ensure the response is a JSON object with an "analysis" field.
`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an intelligent tutor providing feedback." },
                { role: "user", content: analysisPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content || "{}";
        const parsed = JSON.parse(content);

        return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Quiz Analysis Error:", error);
        return new Response(
            JSON.stringify({ analysis: "Great attempt! Keep studying to master " + topic + "." }),
            { status: 200 } // Graceful failure
        );
    }
}
