import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Interview } from "@/models/Interview";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing identity tracking values." }, { status: 400 });
    }

    await connectToDatabase(); 

    const email = session.user.email.trim().toLowerCase();
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return NextResponse.json({ error: "Authenticated profile mismatch." }, { status: 404 });
    }

    const newInterview = await Interview.create({
      userId: userDoc._id,
      topic: topic,
      score: null,
      feedback: "",
      questions: []
    });

    return NextResponse.json({ interviewId: newInterview._id });

  } catch (error) {
    console.error("Database Session Initialization Breakdown:", error);
    return NextResponse.json({ error: "Failed to establish secure log pipeline." }, { status: 500 });
  }
}