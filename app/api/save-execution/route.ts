import { db } from "@/app/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, language, code, output, error } = body;

    const userDoc = await db.users.findFirst({
      where: {
        email,
      },
    });

    if (!email || !language || !code) {
      console.error("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!userDoc) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
    }

    if (!userDoc?.isPro && language !== "javascript") {
      return NextResponse.json(
        { error: "You must be a pro user to run code in this language" },
        { status: 403 }
      );
    }


    const safeOutput = output != null ? String(output) : "No output available";
    const safeError = error != null ? String(error) : "No error occurred";

    await db.codeExecutions.create({
      data: {
        userId: String(userDoc.userId),
        language: String(language),
        code: String(code),
        output: String(safeOutput),
        error: String(safeError),
      },
    });

    return NextResponse.json(
      { message: "Code execution recorded successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error saving execution:", err);
    return NextResponse.json({ error: "Failed to save execution" }, { status: 500 });
  }
}
