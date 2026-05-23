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

    // We now accept the complete visual chat history array along with user fields
    const { problemPrompt, userCode, chatHistory, interviewId } = await req.json();

    if (!problemPrompt || !interviewId || !chatHistory) {
      return NextResponse.json({ error: "Missing required tracking parameters." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are an elite Technical Interviewer conducting a live "Java & DSA" interview session.
      The active problem statement is: "${problemPrompt}".
      
      Analyze the candidate's responses meticulously. 
      - If they submit code, provide a rigorous analysis of correctness, boundary bugs, and Big O complexity.
      - If they are answering a follow-up question you asked, evaluate their explanation or optimization logic.
      
      Always stay in character. Keep responses concise, professional, and ending with a clear direction or next question to keep the interview moving forward. Do not use markdown headers like # or ##.
    `;

    // Map the local UI chat history format directly into Gemini's native context structure
    const formattedContents = chatHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Append the most recent submission context into the payload stream
    if (userCode && userCode.trim() !== "") {
      formattedContents.push({
        role: "user",
        parts: [{ text: `Candidate submitted updated code:\n${userCode}` }]
      });
    }

    // Execute the live conversational generation request
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: { systemInstruction, temperature: 0.7 }
    });

    const aiFeedback = response.text || "The evaluator failed to render conversation text.";

    await connectToDatabase();

    // Log the interaction directly into your MongoDB Atlas historical collection record
    await Interview.findByIdAndUpdate(interviewId, {
      $push: {
        questions: {
          questionText: problemPrompt,
          userAnswer: userCode || "Text response chat query",
          score: 7,
          feedback: aiFeedback
        }
      }
    });

    return NextResponse.json({ text: aiFeedback });

  } catch (error: any) {
    console.error("🚨 Gemini Chat History Pipeline Failure:", error);
    return NextResponse.json({ error: "Internal evaluation pipeline error." }, { status: 500 });
  }
}