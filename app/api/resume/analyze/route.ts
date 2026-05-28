import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import { Resume } from "@/models/Resume";
import { User } from "@/models/User";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse request payload
    const { filename, mimeType, fileData } = await req.json();
    if (!fileData) {
      return NextResponse.json({ error: "Missing resume file content" }, { status: 400 });
    }

    // 3. Connect to Database and retrieve User Doc
    await connectToDatabase();
    const userDoc = await User.findOne({ email: session.user.email });
    if (!userDoc) {
      return NextResponse.json({ error: "User profile mismatch" }, { status: 404 });
    }

    // 4. Construct prompt for Gemini evaluation
    const resumePrompt = `
      You are an expert ATS (Applicant Tracking System) reviewer and technical recruitment specialist.
      Analyze the attached candidate resume PDF and perform a thorough evaluation.
      
      You must respond with a JSON object strictly containing the following schema:
      {
        "atsScore": (number between 0 and 100 representing the ATS matching grade),
        "skills": (array of strings representing key technical tools, frameworks, and programming languages found),
        "yearsOfExperience": (number representing total years of experience, e.g. 2.5 or 4),
        "gaps": (array of strings representing identified technical skill gaps for a standard modern developer role),
        "suggestedQuestions": (array of 3 to 5 custom technical or behavioral interview questions tailored specifically to their resume profile to prepare them for mock interviews),
        "feedback": (string containing a concise, professional diagnostic summary and optimization advice)
      }
      
      Respond ONLY with the JSON object. Do not wrap the JSON output in markdown formatting.
    `;

    // 5. Query Gemini with base64 PDF inline data
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: resumePrompt },
            {
              inlineData: {
                mimeType: mimeType || "application/pdf",
                data: fileData
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const rawJsonText = response.text?.trim() || "{}";
    const analysisResult = JSON.parse(rawJsonText);

    // 6. Save/Update Resume record in Database
    // We save the raw JSON string inside textContent to preserve the structure perfectly
    const resumeRecord = await Resume.findOneAndUpdate(
      { userId: userDoc._id },
      {
        $set: {
          fileUrl: `/uploads/${userDoc._id}_${filename || "resume.pdf"}`,
          textContent: rawJsonText,
          skills: analysisResult.skills || [],
          extractedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      resume: resumeRecord,
      analysis: analysisResult
    });

  } catch (error: any) {
    console.error("Resume Analysis Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during resume analysis", details: error.message },
      { status: 500 }
    );
  }
}
