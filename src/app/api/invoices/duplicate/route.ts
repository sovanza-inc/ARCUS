import { auth } from "@/auth";
import { db } from "@/lib/db";
import { invoices } from "@/db/schema";
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
      return new NextResponse("Missing invoice ID", { status: 400 });
    }

    // First get the invoice to duplicate
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, id),
        eq(invoices.userId, session.user.id)
      ));

    if (!existingInvoice[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Create a new invoice with the same data
    const duplicatedInvoice = await db
      .insert(invoices)
      .values({
        invoiceNumber: `${existingInvoice[0].invoiceNumber} (Copy)`,
        clientName: existingInvoice[0].clientName,
        clientEmail: existingInvoice[0].clientEmail,
        status: "Pending", // Always set as pending for new duplicates
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json(duplicatedInvoice[0]);
  } catch (error) {
    console.error("[INVOICE_DUPLICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
