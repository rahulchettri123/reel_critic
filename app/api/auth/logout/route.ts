import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    console.log("Logging out user, clearing token cookie")

    // Create response with success message
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    )

    // Get the hostname to determine if we're in production
    // This will help set the right cookie parameters
    const cookieStore = cookies();
    const isProduction = process.env.NODE_ENV === "production";
    
    console.log(`Logout environment: ${isProduction ? "production" : "development"}`);

    // Method 1: Using delete with appropriate settings
    response.cookies.delete({
      name: "token",
      path: "/",
      // No domain in development, auto-detect in production
      ...(isProduction && { secure: true })
    })
    
    // Method 2: Set with empty value and immediate expiry
    // This is a more aggressive approach that works better across browsers
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
      path: "/",
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    })
    
    // Method 3: Set another cookie with the same name in the root path
    // This can help clear cookies that might be stuck in different paths
    response.cookies.set({
      name: "token",
      value: "deleted",
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
      path: "/",
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    })

    console.log("Token cookies cleared using multiple methods")
    
    // Add cache control headers to prevent caching of the logout response
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}

