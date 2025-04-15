import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { calendarEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, startTime, endTime, location } = body;

    // Parse the date string and adjust for timezone
    const eventDate = new Date(date);
    const timezoneOffset = eventDate.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const adjustedDate = new Date(eventDate.getTime() - timezoneOffset);
    const dateString = adjustedDate.toISOString().split('T')[0];

    // Combine date with time strings to create proper Date objects
    const startDate = new Date(`${dateString}T${startTime}`);
    const endDate = new Date(`${dateString}T${endTime}`);

    // Insert the event into the database
    const event = await db.insert(calendarEvents).values({
      title,
      description: description || null,
      startTime: startDate,
      endTime: endDate,
      location: location || null,
      userId: session.user.id,
      allDay: false,
      color: "#FF5F1F",
      recurring: { type: "none", interval: 1, until: null },
    }).returning();

    return NextResponse.json(event[0]);
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await db.select().from(calendarEvents).where(
      eq(calendarEvents.userId, session.user.id)
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
