import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Contact } from "@/models/Contact";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || "General inquiry",
      message: message.trim(),
    });

    return NextResponse.json(
      { success: true, message: "Thank you! Your message has been sent." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact POST Error:", error);
    return NextResponse.json(
      { error: "Unable to save your message right now. Please try again later." },
      { status: 500 }
    );
  }
}
