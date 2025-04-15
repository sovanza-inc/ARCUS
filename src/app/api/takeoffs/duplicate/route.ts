import { auth } from "@/auth";
import { db } from "@/lib/db";
import { takeoffs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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
    const { id } = body;

    if (!id) {
      return new NextResponse("Missing takeoff ID", { status: 400 });
    }

    // First get the takeoff to duplicate
    const existingTakeoff = await db
      .select()
      .from(takeoffs)
      .where(and(
        eq(takeoffs.id, id),
        eq(takeoffs.userId, session.user.id)
      ));

    if (!existingTakeoff[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Create a new takeoff with the same data
    const duplicatedTakeoff = await db
      .insert(takeoffs)
      .values({
        quoteNumber: `${existingTakeoff[0].quoteNumber} (Copy)`,
        clientName: existingTakeoff[0].clientName,
        clientEmail: existingTakeoff[0].clientEmail,
        status: "Pending", // Always set as pending for new duplicates
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json(duplicatedTakeoff[0]);
  } catch (error) {
    console.error("[TAKEOFF_DUPLICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}