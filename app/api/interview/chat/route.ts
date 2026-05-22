import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI client with the key from your environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { problemPrompt, userCode } = await req.json();

    if (!problemPrompt || !userCode) {
      return NextResponse.json({ error: "Missing required playground values." }, { status: 400 });
    }

    // System instruction block to force the model to behave like an elite technical interviewer
    const systemInstruction = `
      You are an elite Technical Interviewer conducting a coding assessment. 
      The candidate is practicing a "Java & DSA" interview session.
      Analyze their code solution against the problem prompt provided.
      
      Provide your response in a supportive yet rigorous technical format. Focus on:
      1. Correctness and edge cases.
      2. Time and Space Complexity using Big O notation.
      3. A clear follow-up question prompting them to explain their logic or optimize their approach.
      Keep your response concise and professional, appropriate for an active code interview panel.
    `;

    // Execute the live text generation model query using gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Problem Prompt: ${problemPrompt}\n\nCandidate's Java Code:\n${userCode}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const aiFeedback = response.text || "The evaluator failed to render analysis text.";
    
    return NextResponse.json({ text: aiFeedback });

  } catch (error) {
    console.error("Gemini API Pipeline Error:", error);
    return NextResponse.json({ error: "Internal evaluation server failure." }, { status: 500 });
  }
}