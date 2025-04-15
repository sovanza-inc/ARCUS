import { auth } from "@/auth";
import { db } from "@/lib/db";
import { takeoffs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Update takeoff
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { quoteNumber, clientName, clientEmail, status } = body;

    if (!quoteNumber || !clientName || !clientEmail) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // First check if the takeoff exists and belongs to the user
    const existingTakeoff = await db
      .select()
      .from(takeoffs)
      .where(and(
        eq(takeoffs.id, params.id),
        eq(takeoffs.userId, session.user.id)
      ));

    if (!existingTakeoff[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    const updatedTakeoff = await db
      .update(takeoffs)
      .set({
        quoteNumber,
        clientName,
        clientEmail,
        status: status || "Pending",
        updatedAt: new Date(),
      })
      .where(and(
        eq(takeoffs.id, params.id),
        eq(takeoffs.userId, session.user.id)
      ))
      .returning();

    return NextResponse.json(updatedTakeoff[0]);
  } catch (error) {
    console.error("[TAKEOFF_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get single takeoff
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const takeoff = await db
      .select()
      .from(takeoffs)
      .where(and(
        eq(takeoffs.id, params.id),
        eq(takeoffs.userId, session.user.id)
      ));

    if (!takeoff[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(takeoff[0]);
  } catch (error) {
    console.error("[TAKEOFF_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete takeoff
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if the takeoff exists and belongs to the user
    const existingTakeoff = await db
      .select()
      .from(takeoffs)
      .where(and(
        eq(takeoffs.id, params.id),
        eq(takeoffs.userId, session.user.id)
      ));

    if (!existingTakeoff[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    await db
      .delete(takeoffs)
      .where(and(
        eq(takeoffs.id, params.id),
        eq(takeoffs.userId, session.user.id)
      ));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TAKEOFF_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
