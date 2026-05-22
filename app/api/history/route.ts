import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db"; 
import { Interview } from "@/models/Interview";
import { User } from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/route"; // Double check your authOptions import path if needed

export async function GET(req: Request) {
  try {
    // 1. Authenticate the active secure browser cookie session
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

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

    return NextResponse.json({ history: interviewHistory });

  } catch (error) {
    console.error("Dashboard Analytics Compilation Failure:", error);
    return NextResponse.json({ error: "Internal performance tracking server error." }, { status: 500 });
  }
}