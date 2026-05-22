import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db"; // ◄── CHANGED TO connectToDatabase
import { Interview } from "../../../../models/Interview";
import { User } from "../../../../models/User";

export async function POST(req: Request) {
  try {
    const session = await req.json();
    const { email, topic } = session;

    if (!email || !topic) {
      return NextResponse.json({ error: "Missing identity tracking values." }, { status: 400 });
    }

    // ◄── CALL THE CORRECT FUNCTION NAME HERE
    await connectToDatabase(); 

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