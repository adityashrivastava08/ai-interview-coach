import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "../../../../lib/db"; 

export async function POST(req: Request) {
  try {
    // 1. NextAuth Session check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Frontend payload check
    const { track, messages } = await req.json();
    if (!track || !messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 3. Database connection initiate kiya
    const mongooseInstance = await connectToDatabase();
    const db = mongooseInstance.connection.db;
    
    if (!db) {
      return NextResponse.json({ error: "Database instance not found" }, { status: 500 });
    }

    // 4. 🔥 Clean Native MongoDB Query: Bina kisi extra invalid options ke direct push
    const updateResult = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $push: {
          interviews: {
            track: track,
            date: new Date(),
            questions: messages // Poori chat array push ho rahi hai
          }
        }
      } as any
    );

    console.log("Database update response:", updateResult);

    // 5. Success response return karna zaroori hai taaki await block tute
    return NextResponse.json({ success: true, message: "Interview saved successfully!" });

  } catch (error: any) {
    console.error("Save Interview Error in API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}