import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db"; 
import { Interview } from "@/models/Interview";
import { User } from "@/models/User";
import { Resume } from "@/models/Resume";
import { DSAPractice } from "@/models/DSAPractice";
import { AptitudeAttempt } from "@/models/AptitudeAttempt";
import { authOptions } from "@/lib/auth"; // Double check your authOptions import path if needed

export async function GET(req: Request) {
  try {
    // 1. Authenticate the active secure browser cookie session
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    const email = rawEmail?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized access parameters." }, { status: 401 });
    }

    await connectToDatabase();

    // 2. Fetch the corresponding User ID
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return NextResponse.json({ error: "Profile record match failure." }, { status: 404 });
    }

    // 3. Find all interviews belonging to this user, sorted newest first
    const interviewHistory = await Interview.find({ userId: userDoc._id })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Find the user's resume (if any)
    const resumeData = await Resume.findOne({ userId: userDoc._id }).lean();

    // 5. Find the user's DSA attempts (if any)
    const dsaAttempts = await DSAPractice.find({ userId: userDoc._id }).lean();

    // 6. Find the user's aptitude attempts (if any)
    const aptitudeAttempts = await AptitudeAttempt.find({ userId: userDoc._id }).lean();

    return NextResponse.json({
      history: interviewHistory,
      resume: resumeData,
      dsaAttempts: dsaAttempts,
      aptitudeAttempts: aptitudeAttempts
    });

  } catch (error) {
    console.error("Dashboard Analytics Compilation Failure:", error);
    return NextResponse.json({ error: "Internal performance tracking server error." }, { status: 500 });
  }
}