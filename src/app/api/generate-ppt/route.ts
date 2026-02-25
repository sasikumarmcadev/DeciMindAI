import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic } = body;

        if (!topic) {
            return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400 });
        }

        if (!process.env.GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "GROQ_API_KEY is missing in environment variables" }), { status: 500 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Call Groq API using the SDK
        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a presentation expert. Always respond with valid JSON."
                    },
                    {
                        role: "user",
                        content: `Create a highly detailed 10-slide presentation about "${topic}".
Make each slide comprehensive with 5-6 substantial, descriptive points.
For each slide, also provide a short, descriptive keyword or phrase to search for a related stock image (e.g., "modern office building", "abstract technology network").
Return a JSON object exactly like this, no additional text, markdown formatting or explanations:
{
  "title": "Presentation Title",
  "slides": [
    { 
      "title": "Slide Title", 
      "points": ["Detailed point 1...", "Detailed point 2...", "Detailed point 3...", "Detailed point 4..."],
      "imageKeyword": "relevant image search term"
    }
  ]
}`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });

            let content = completion.choices[0].message.content || "";

            // Safely parse JSON
            if (content.startsWith('```')) {
                content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            const parsedData = JSON.parse(content);
            let slidesData;

            if (parsedData.slides && Array.isArray(parsedData.slides)) {
                slidesData = parsedData.slides;
            } else if (Array.isArray(parsedData)) {
                slidesData = parsedData;
            } else {
                const arrayValue = Object.values(parsedData).find(Array.isArray);
                if (arrayValue) {
                    slidesData = arrayValue;
                } else {
                    throw new Error("Could not find array of slides in the AI response");
                }
            }

            return new Response(JSON.stringify({
                title: parsedData.title || `${topic} Presentation`,
                slides: slidesData
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });

        } catch (apiError: any) {
            console.error("Groq API Error:", apiError);
            return new Response(JSON.stringify({
                error: apiError.message || "AI generation failed",
                details: apiError.response?.data || null
            }), { status: 500 });
        }
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal server error" }),
            { status: 500 }
        );
    }
}
