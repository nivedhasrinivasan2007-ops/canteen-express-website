import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For now, we'll allow access to admin routes
    // In a real application, you would implement proper admin role checking
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/cart", "/checkout", "/orders", "/admin/:path*"],
};