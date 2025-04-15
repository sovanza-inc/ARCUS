import { auth } from "@/auth";
import { db } from "@/lib/db";
import { takeoffs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { quoteNumber, clientName, clientEmail, status } = body;

    // Validate required fields
    if (!quoteNumber || !clientName || !clientEmail) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const insertedTakeoffs = await db
      .insert(takeoffs)
      .values({
        quoteNumber,
        clientName,
        clientEmail,
        status: status || "Pending",
        userId: session.user.id, // Associate with the current user
      })
      .returning();

    return NextResponse.json(insertedTakeoffs[0]);
  } catch (error) {
    console.error("[TAKEOFFS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userTakeoffs = await db
      .select()
      .from(takeoffs)
      .where(eq(takeoffs.userId, session.user.id))
      .orderBy(takeoffs.createdAt);

    return NextResponse.json(userTakeoffs);
  } catch (error) {
    console.error("[TAKEOFFS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
