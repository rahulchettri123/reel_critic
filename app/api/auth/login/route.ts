import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getCollection } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`Attempting login for email: ${email}`)

    // Get users collection
    const usersCollection = await getCollection("users")
    if (!usersCollection) {
      console.error("Failed to get users collection")
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Find user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.log(`No user found with email: ${email}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token with proper payload
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("LOGIN ROUTE: JWT_SECRET environment variable is not set!")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }
    
    console.log(`LOGIN ROUTE: Creating JWT token for user: ${email}, ID: ${user._id}`)
    
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: "7d" }
    )

    // Return user data and token (excluding password)
    const { password: _, ...userWithoutPassword } = user

    console.log(`Login successful for user: ${email}, token created successfully`)

    // Set HTTP-only cookie with the token
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: userWithoutPassword,
      },
      { status: 200 }
    )

    // Determine if we're in production mode
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`Login environment: ${isProduction ? "production" : "development"}`);

    // Configure cookie with environment-specific settings
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: isProduction, // Only use secure in production
      sameSite: isProduction ? "none" : "lax", // Use 'none' in production for cross-site cookies
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    })

    // Log cookie settings for debugging
    console.log(`Cookie set for user: ${email}, cookie length: ${token.length}`);
    console.log(`Cookie properties: httpOnly=true, secure=${isProduction}, sameSite=${isProduction ? "none" : "lax"}, path=/, maxAge=${7 * 24 * 60 * 60}`);
    
    // Set cache control headers
    response.headers.set("Cache-Control", "no-store, private");
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

