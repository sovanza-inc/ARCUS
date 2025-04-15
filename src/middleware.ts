import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const isOnPublicRoute = req.nextUrl.pathname === "/" || 
                       req.nextUrl.pathname === "/sign-in" || 
                       req.nextUrl.pathname === "/sign-up";

  const session = await auth();

  if (isOnPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isOnPublicRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return null;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
