import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import { AptitudeAttempt } from "@/models/AptitudeAttempt";
import { User } from "@/models/User";

// Answer keys mapping: questionId -> correctOptionIndex
const APTITUDE_ANSWERS: Record<string, number> = {
  "apt-1": 1, // 4/7
  "apt-2": 3, // Neither follows
  "apt-3": 2, // 8/15
  "apt-4": 0, // QDFHS
  "apt-5": 2  // $160
};

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse request payload
    const { questionId, selectedOption } = await req.json();
    if (!questionId || selectedOption === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Evaluate answer correctness
    const correctOption = APTITUDE_ANSWERS[questionId];
    if (correctOption === undefined) {
      return NextResponse.json({ error: "Invalid question identifier" }, { status: 400 });
    }

    const isCorrect = Number(selectedOption) === correctOption;

    // 4. Connect to Database and find User
    await connectToDatabase();
    const userDoc = await User.findOne({ email: session.user.email });
    if (!userDoc) {
      return NextResponse.json({ error: "User profile mismatch" }, { status: 404 });
    }

    // 5. Save or update attempt in database
    const attempt = await AptitudeAttempt.findOneAndUpdate(
      { userId: userDoc._id, questionId },
      {
        $set: {
          selectedOption: Number(selectedOption),
          isCorrect,
          solvedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      isCorrect,
      correctOption,
      attempt
    });

  } catch (error: any) {
    console.error("Aptitude Attempt Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during aptitude check", details: error.message },
      { status: 500 }
    );
  }
}
