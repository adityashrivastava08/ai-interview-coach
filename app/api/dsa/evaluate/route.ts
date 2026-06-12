import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DSAPractice } from "@/models/DSAPractice";
import { User } from "@/models/User";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse request payload
    const { questionId, code, language } = await req.json();
    if (!questionId || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Construct prompt for Gemini evaluation
    const evaluationPrompt = `
      You are an expert technical interviewer and algorithms specialist.
      Evaluate the candidate's submitted DSA code for correctness, performance, and best practices.

      Problem Key: ${questionId}
      Programming Language: ${language || "javascript"}
      Candidate Submission:
      \`\`\`${language || "javascript"}
      ${code}
      \`\`\`

      You must evaluate the code and respond with a JSON object strictly matching this schema:
      {
        "status": "solved" (if the code is correct, passes all logical edge cases, and has optimal or near-optimal complexity) or "attempted" (if there are bugs, compiler errors, infinite loops, or extremely poor space/time complexities),
        "score": (number from 0 to 10 evaluating the overall quality of the code),
        "timeComplexity": "e.g. O(N), O(N log N) or O(2^N)",
        "spaceComplexity": "e.g. O(1) or O(N)",
        "feedback": "A concise, 2-3 sentence technical critique explaining if the logic is correct, and highlighting potential bottlenecks or clean-code tips."     
      }

      Respond ONLY with the JSON object. Do not wrap the JSON output in markdown formatting.
    `;

    // 4. Query Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(evaluationPrompt);
    const response = await result.response;
    const rawJsonText = response.text()?.trim() || "{}";
    
    let resultJson;
    try {
      // Clean up potential markdown formatting if Gemini ignored the instruction
      const cleanedJson = rawJsonText.replace(/```json|```/g, "").trim();
      resultJson = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Failed to parse AI JSON:", rawJsonText);
      resultJson = { status: "attempted", score: 5, feedback: "Error parsing AI feedback." };
    }

    // 5. Connect to Database and retrieve User Doc
    await connectToDatabase();
    const userDoc = await User.findOne({ email: session.user.email });
    if (!userDoc) {
      return NextResponse.json({ error: "User profile mismatch" }, { status: 404 });
    }

    // 6. Update or Insert Practice attempt
    const practiceRecord = await DSAPractice.findOneAndUpdate(
      { userId: userDoc._id, questionId },
      {
        $set: {
          status: resultJson.status || "attempted",
          submittedCode: code,
          feedback: resultJson.feedback || "Attempt recorded.",
          score: resultJson.score || 5,
          timeComplexity: resultJson.timeComplexity || "N/A",
          spaceComplexity: resultJson.spaceComplexity || "N/A",
          attemptedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      result: practiceRecord,
      evaluation: resultJson
    });

  } catch (error: any) {
    console.error("DSA Evaluation Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during DSA evaluation", details: error.message },
      { status: 500 }
    );
  }
}
