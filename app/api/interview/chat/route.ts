import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { connectToDatabase } from "../../../../lib/db";
import { Interview } from "../../../../models/Interview";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "Server configuration missing API key." }, { status: 500 });
    }

    const { problemPrompt, userCode, interviewId } = await req.json();

    if (!problemPrompt || !userCode || !interviewId) {
      return NextResponse.json({ error: "Missing required tracking parameters." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are an elite Technical Interviewer evaluating a "Java & DSA" code run.
      Analyze the candidate's solution code against the question statement.
      
      Provide your response in a supportive yet rigorous technical format. You MUST include these three bullet items clearly:
      - **Evaluation:** Assess correctness, edge cases, and architectural flaws.
      - **Complexity:** Time and Space complexity using Big O notation.
      - **Follow-up Challenge:** A critical follow-up question forcing them to optimize or handle boundary failures.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Problem Prompt: ${problemPrompt}\n\nCandidate's Java Code:\n${userCode}`,
      config: { systemInstruction, temperature: 0.7 }
    });

    const aiFeedback = response.text || "The evaluator failed to render analysis text.";

    await connectToDatabase();

    // Securely update the interview history log document
    await Interview.findByIdAndUpdate(interviewId, {
      $push: {
        questions: {
          questionText: problemPrompt,
          userAnswer: userCode,
          score: 7, // Stamping a solid default milestone score for tracking analytics
          feedback: aiFeedback
        }
      }
    });

    return NextResponse.json({ text: aiFeedback });

  } catch (error: any) {
    console.error("🚨 Gemini Core Database Pipeline Collapse:", error);
    return NextResponse.json({ error: "Internal evaluation pipeline error." }, { status: 500 });
  }
}