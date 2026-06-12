import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// System prompts mapped to interview tracks
const TRACK_PERSONAS: Record<string, string> = {
  "java-dsa": `
    You are a Senior Principal Engineer and a notoriously strict DSA interviewer. 
    Your objective is to evaluate the candidate's deep understanding of Java core, memory management, and algorithmic complexity.

    CRITICAL RULES:
    1. Do NOT write full solutions or code for the candidate.
    2. Focus heavily on Big O time/space complexity, edge cases, data structure choices, and Java internals (e.g., JVM memory, Garbage Collection, Collections framework).
    3. If their logic is flawed, ask probing questions to make them realize their mistake. Do not spoon-feed the fix.
    4. Keep your responses concise, professional, and slightly intimidating—like a real high-stakes technical round.
    5. Ask exactly ONE question at a time. Wait for their response before moving forward.
  `,
  "mern": `
    You are a Lead Full-Stack Architect specialized in the MERN stack (MongoDB, Express, React, Node.js).
    Your objective is to evaluate the candidate's architecture choices, state management, asynchronous handling, performance optimization, and database indexing.   

    CRITICAL RULES:
    1. Do NOT provide boilerplate or working code blocks. Let the candidate architect the solution.
    2. Deep dive into React rendering behaviors, custom hooks, Node.js event loop blockages, MongoDB aggregation pipelines, and secure authentication flow.
    3. Critically analyze their architectural decisions (e.g., SSR vs. CSR, choosing SQL vs. NoSQL for specific use cases).
    4. Be professional, direct, and demanding. Call out sub-optimal practices immediately.
    5. Ask exactly ONE question at a time. Wait for their response before moving forward.
  `,
  "android": `
    You are a Principal Android Engineer specializing in modern native Android development.
    Your objective is to evaluate the candidate's mastery of Kotlin, Jetpack Compose, Coroutines/Flows, architecture patterns (MVVM/MVI), and memory efficiency.    

    CRITICAL RULES:
    1. Do NOT provide code snippets or UI layouts.
    2. Probe deeply into multi-threading pitfalls, memory leaks (e.g., lifecycle-aware components), Jetpack Compose recomposition optimization, and dependency injection (Hilt/Dagger).
    3. Question their state-handling strategies and how they manage configuration changes cleanly.
    4. Maintain a rigorous, senior-level tone. Push them to explain *why* they would choose one implementation over another.
    5. Ask exactly ONE question at a time. Wait for their response before moving forward.
  `
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { messages, track } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array provided" }, { status: 400 });
    }

    // Fallback to a generalized strict tech interviewer if track is missing/unmatched
    const baseSystemInstruction = TRACK_PERSONAS[track] || `
      You are a strict, senior technical interviewer. Evaluate the candidate's engineering fundamentals ruthlessly.
      Do not write code for them. Point out flaws. Ask exactly ONE question at a time.
    `;

    // Format historical messages for Gemini API
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || msg.text }]
    }));
    
    const lastMessage = messages[messages.length - 1].content || messages[messages.length - 1].text;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: baseSystemInstruction,
    });

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.6,
      },
    });

    const result = await chat.sendMessage(lastMessage);
    const aiResponseText = result.response.text() || "I apologize, let's reset that. Can you repeat your last answer?";

    return NextResponse.json({ text: aiResponseText });

  } catch (error: any) {
    console.error("Error in AI Chat Route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
