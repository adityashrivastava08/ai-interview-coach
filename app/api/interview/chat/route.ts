import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { connectToDatabase } from "../../../../lib/db"; // ◄── CHANGED TO connectToDatabase
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
      
      You must respond strictly in this format:
      [FEEDBACK] Give a concise assessment of correctness, flaws, or time/space complexities using Big O.
      [SCORE] Give a numeric evaluation from 1 to 10 based on code quality.
      [QUESTION] Provide a critical follow-up question forcing them to optimize or handle boundary failures.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Problem Prompt: ${problemPrompt}\n\nCandidate's Java Code:\n${userCode}`,
      config: { systemInstruction, temperature: 0.7 }
    });

    const rawOutput = response.text || "";

    const feedbackText = rawOutput.split("[SCORE]")[0]?.replace("[FEEDBACK]", "")?.trim() || rawOutput;
    const trackingRest = rawOutput.split("[SCORE]")[1] || "";
    const numericScoreStr = trackingRest.split("[QUESTION]")[0]?.trim() || "5";
    const followUpQuestion = trackingRest.split("[QUESTION]")[1]?.trim() || "Can you review your logic boundaries?";

    const finalScore = parseInt(numericScoreStr, 10) || 5;

    // ◄── CALL THE CORRECT FUNCTION NAME HERE
    await connectToDatabase(); 

    await Interview.findByIdAndUpdate(interviewId, {
      $push: {
        questions: {
          questionText: problemPrompt,
          userAnswer: userCode,
          score: finalScore,
          feedback: feedbackText
        }
      }
    });

    return NextResponse.json({ text: `${feedbackText}\n\n💡 Follow-up Challenge:\n${followUpQuestion}` });

  } catch (error: any) {
    console.error("🚨 Gemini Core Database Pipeline Collapse:", error);
    return NextResponse.json({ error: "Internal session handling exception." }, { status: 500 });
  }
}