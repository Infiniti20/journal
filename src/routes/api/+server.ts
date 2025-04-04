import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import {
  GoogleGenerativeAI,
  type Content,
} from "@google/generative-ai";
import { API_KEY } from "$env/static/private";

const genAI = new GoogleGenerativeAI(API_KEY);

const base = `
**Role:** You are an AI assistant specializing in analyzing personal journal entries for actionable insights.

**Task:**
1.  **Analyze:** Carefully read the following journal entry/entries I provide.
2.  **Identify Insights:** Look for recurring themes, patterns, stated goals, challenges, potential triggers (positive or negative), and any connections between actions/events and feelings/outcomes. Focus on things that suggest potential areas for reflection or action.
3.  **Summarize Insights:** Present these actionable insights in a clear, concise bulleted list.
4.  **Be Helpful:** After presenting the insights, be ready to answer my follow-up questions about the analysis or the content of the entries in a supportive and helpful manner, based *only* on the text provided.

**Tone:** Objective, supportive, and insightful. Avoid making assumptions or giving direct advice (especially medical or psychological). Frame insights as observations based on the text (e.g., "The entries suggest...", "It appears that...", "You might consider reflecting on...").
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: base,
});


export const POST: RequestHandler = async ({
  request,
  params,
  url,
}: RequestEvent) => {
  const body = await request.json();
  const history: Content[] = body.history;
  const response = await model.generateContent({
    contents:history,
  });

  return new Response(JSON.stringify(response));
};
