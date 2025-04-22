import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "5") // Default to 5 users
  
  try {
    const usersCollection = await getCollection("users")
    
    // Fetch recently joined users, sorted by createdAt in descending order
    const recentUsers = await usersCollection.find(
      {}, // No filter, get all users
      {
        // Only return necessary fields
        projection: {
          _id: 1,
          name: 1,
          username: 1,
          avatar: 1,
          createdAt: 1
        },
        // Sort by creation date, newest first
        sort: { createdAt: -1 },
        // Limit to the requested number
        limit: limit
      }
    ).toArray()
    
    return NextResponse.json({ 
      success: true, 
      users: recentUsers
    })
  } catch (error) {
    console.error("Error fetching recent users:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent users" },
      { status: 500 }
    )
  }
} 