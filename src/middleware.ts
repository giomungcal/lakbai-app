import { clerkMiddleware } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export default async function middleware(request: NextRequest, event: any) {
  try {
    // Run Clerk middleware
    const clerkResponse = await clerkMiddleware()(request, event);

    // Update user's auth session
    const sessionResponse = await updateSession(request);

    // Return the combined response
    return clerkResponse || sessionResponse;
  } catch (error) {
    // Handle error (optional logging or response)
    console.error("Middleware error:", error);
    // You might want to return a specific error response or rethrow
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
