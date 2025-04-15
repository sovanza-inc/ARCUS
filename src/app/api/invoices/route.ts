import { auth } from "@/auth";
import { db } from "@/lib/db";
import { invoices } from "@/db/schema";
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
    const { clientName, clientEmail, status } = body;

    // Validate required fields...
    if (!clientName || !clientEmail) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate invoice number (INV-YYMMDD-XXXX)
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const invoiceNumber = `INV-${year}${month}${day}-${random}`;

    const insertedInvoices = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        clientName,
        clientEmail,
        status: status || "Pending",
        userId: session.user.id, // Associate with the current user
      })
      .returning();

    return NextResponse.json(insertedInvoices[0]);
  } catch (error) {
    console.error("[INVOICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, session.user.id))
      .orderBy(invoices.createdAt);

    return NextResponse.json(userInvoices);
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
