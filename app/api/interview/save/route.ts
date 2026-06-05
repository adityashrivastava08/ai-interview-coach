import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import { Interview } from "@/models/Interview";
import { User } from "@/models/User";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request payload
    const { track, messages } = await req.json();
    if (!track || !messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing interview session data" }, { status: 400 });
    }

    // 3. Connect to Database and find User
    await connectToDatabase();
    const userDoc = await User.findOne({ email: session.user.email.trim().toLowerCase() });
    if (!userDoc) {
      return NextResponse.json({ error: "User profile mismatch" }, { status: 404 });
    }

    // 4. Call Gemini to evaluate the transcript and compile structured diagnostic assessment
    const transcriptText = messages
      .map((msg: any) => `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content || msg.text}`)
      .join("\n\n");

    const evaluationPrompt = `
      You are an expert Senior Technical Recruiter and Bar Raiser.
      Evaluate the technical mock interview dialogue transcript between the Interviewer and the Candidate.
      
      Track Domain: ${track}
      Full Transcript:
      ${transcriptText}
      
      Analyze the candidate's performance. Review each question asked and their corresponding answer.
      You must respond with a JSON object strictly containing the following schema:
      {
        "overallScore": (number between 1 and 10 representing the candidate's average score),
        "overallFeedback": (string containing a professional 3-4 sentence comprehensive summary of their performance, strengths, and key growth areas),
        "questions": [
          {
            "questionText": (string, the exact question text asked by the Interviewer),
            "userAnswer": (string, the exact response text given by the Candidate),
            "score": (number between 1 and 10 representing the quality of this response),
            "feedback": (string, 1-2 sentence detailed critique of their answer, pointing out what was correct and what was missing or incorrect)
          }
        ]
      }
      
      Important rules for formatting the JSON array:
      - Pair each question asked by the interviewer with the subsequent answer given by the candidate.
      - If a question was skipped or not answered, record userAnswer as "[No response]" or "[Skipped]" and score accordingly.
      - Respond ONLY with the raw JSON object. Do not wrap the JSON output in markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const rawJsonText = response.text?.trim() || "{}";
    let result: any = {};
    try {
      result = JSON.parse(rawJsonText);
    } catch (parseErr: any) {
      console.warn("Standard JSON parse failed, trying regex extraction...", parseErr);
      const jsonMatch = rawJsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (matchErr: any) {
          console.error("JSON extraction parse failed:", matchErr);
          throw new Error("Invalid evaluation format returned by AI: " + matchErr.message);
        }
      } else {
        throw new Error("Failed to parse evaluation response: " + parseErr.message);
      }
    }

    // 5. Create the Interview Document in Database
    const newInterview = await Interview.create({
      userId: userDoc._id,
      topic: track.replace("-", " ").toUpperCase(),
      score: result.overallScore || 6,
      feedback: result.overallFeedback || "Evaluation completed successfully.",
      questions: (result.questions || []).map((q: any) => ({
        questionText: q.questionText || "DSA / Technical concept overview",
        userAnswer: q.userAnswer || "",
        score: q.score || 5,
        feedback: q.feedback || "Attempt recorded."
      })),
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Interview saved and analyzed successfully!",
      interview: newInterview
    });

  } catch (error: any) {
    console.error("Save & Analyze Interview Error in API:", error);
    return NextResponse.json(
      { error: "Internal Server Error during interview evaluation", details: error.message },
      { status: 500 }
    );
  }
}