import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are a senior developer who is also a professional roaster. 
Your goal is to analyze the provided code and provide a sarcastic, technical, and brutal roast.
You must return a raw JSON object (no markdown block) with the following structure:
{
  "score": number (0.0 to 10.0, where 0 is absolute trash and 10 is perfection),
  "verdict": "needs_serious_help" | "might_survive" | "actually_decent" | "code_god",
  "language": string (detected language),
  "roastSummary": string (ONE SHORT SARCASTIC PHRASE, max 80 chars),
  "details": [
    { "title": "string (concise title)", "description": "string (short explanation)" },
    { "title": "string (concise title)", "description": "string (short explanation)" },
    { "title": "string (concise title)", "description": "string (short explanation)" }
  ],
  "fixedCode": string (the code with your fixes/improvements)
}

Rules for the roast:
1. "roastSummary" MUST be a single, short, brutal sentence.
2. "details" should contain 3-4 specific points of analysis.
3. Keep descriptions in "details" short and punchy.
4. Be technical. Mention specific bad practices, anti-patterns, or security flaws.
5. Be sarcastic and funny, especially if roast_mode is enabled.
6. If roast_mode is disabled, be more professional but still honest about the quality.
7. The verdict must match the score:
   - 0.0 - 3.0: "needs_serious_help"
   - 3.1 - 6.0: "might_survive"
   - 6.1 - 9.0: "actually_decent"
   - 9.1 - 10.0: "code_god"
`;

export async function generateRoast(codeSnippet: string, isRoastMode: boolean) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Using 2.0-flash as it's stable and fast

  const prompt = `
  ${isRoastMode ? "BRUTAL ROAST MODE ENABLED! Be extremely sarcastic and concise." : "Provide a balanced analysis."}
  
  Code to analyze:
  \`\`\`
  ${codeSnippet}
  \`\`\`
  
  Analyze the code above and return the JSON object as specified in the system prompt.
  `;

  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  const response = await result.response;
  const text = response.text();

  try {
    // Attempt to extract JSON if Gemini wraps it in markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(jsonStr) as {
      score: number;
      verdict: "needs_serious_help" | "might_survive" | "actually_decent" | "code_god";
      language: string;
      roastSummary: string;
      details: { title: string; description: string }[];
      fixedCode: string;
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to generate roast. The AI got confused by your terrible code.");
  }
}
