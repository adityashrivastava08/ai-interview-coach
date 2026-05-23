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

    const { interviewId, chatHistory } = await req.json();

    if (!interviewId || !chatHistory || chatHistory.length === 0) {
      return NextResponse.json({ error: "Missing session context parameters." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const diagnosticInstruction = `
      You are an Executive Technical Bar Raiser evaluating a completed technical interview.
      Review the provided transcript of the conversation, focusing on the candidate's Java code quality, optimization logic, and problem-solving communication.
      
      You must evaluate their performance and provide a response strictly in this formatting template:
      [SUMMARY] Write a professional 3-4 sentence comprehensive breakdown summary of their strengths and explicit areas for growth.
      [FINAL_SCORE] Provide a single integer rating from 1 to 10 evaluating their readiness. Do not include extra text in this block.
    `;

    // Process the entire conversation feed history block
    const transcriptText = chatHistory
      .map((msg: any) => `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.text}`)
      .join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Complete Interview Transcript:\n\n${transcriptText}`,
      config: { systemInstruction: diagnosticInstruction, temperature: 0.3 } // Lower temperature for more accurate grading
    });

    const rawOutput = response.text || "";

    // Parse values from our custom diagnostic layout brackets
    const summaryText = rawOutput.split("[FINAL_SCORE]")[0]?.replace("[SUMMARY]", "")?.trim() || "Evaluation completed successfully.";
    const scoreStr = rawOutput.split("[FINAL_SCORE]")[1]?.trim() || "6";
    const numericScore = parseInt(scoreStr, 10) || 6;

    await connectToDatabase();

    // UPDATE DATABASE DOCUMENT STATE PERMANENTLY
    await Interview.findByIdAndUpdate(interviewId, {
      $set: {
        score: numericScore,
        feedback: summaryText
      }
    });

    return NextResponse.json({ 
      success: true, 
      finalScore: numericScore, 
      feedbackSummary: summaryText 
    });

  } catch (error: any) {
    console.error("🚨 Session Evaluation Closure Failure:", error);
    return NextResponse.json({ error: "Internal session summary calculation crash." }, { status: 500 });
  }
}
