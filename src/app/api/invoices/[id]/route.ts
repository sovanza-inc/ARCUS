import { auth } from "@/auth";
import { db } from "@/lib/db";
import { invoices } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Update invoice
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
    const { invoiceNumber, clientName, clientEmail, status } = body;

    if (!invoiceNumber || !clientName || !clientEmail) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // First check if the invoice exists and belongs to the user
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, params.id),
        eq(invoices.userId, session.user.id)
      ));

    if (!existingInvoice[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    const updatedInvoice = await db
      .update(invoices)
      .set({
        invoiceNumber,
        clientName,
        clientEmail,
        status: status || "Pending",
        updatedAt: new Date(),
      })
      .where(and(
        eq(invoices.id, params.id),
        eq(invoices.userId, session.user.id)
      ))
      .returning();

    return NextResponse.json(updatedInvoice[0]);
  } catch (error) {
    console.error("[INVOICE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get single invoice
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invoice = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, params.id),
        eq(invoices.userId, session.user.id)
      ));

    if (!invoice[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(invoice[0]);
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete invoice
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if the invoice exists and belongs to the user
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, params.id),
        eq(invoices.userId, session.user.id)
      ));

    if (!existingInvoice[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    await db
      .delete(invoices)
      .where(and(
        eq(invoices.id, params.id),
        eq(invoices.userId, session.user.id)
      ));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INVOICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
