import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    // Get username from query params
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Get users collection
    const usersCollection = await getCollection("users")

    // Check if username already exists
    const existingUser = await usersCollection.findOne({ username })
    const isAvailable = !existingUser

    // If username is available, return success
    if (isAvailable) {
      return NextResponse.json({ available: true })
    }

    // If username is not available, generate suggestions
    const suggestions = generateUsernameSuggestions(username)
    
    // Check which suggestions are available
    const availableSuggestions = []
    for (const suggestion of suggestions) {
      const exists = await usersCollection.findOne({ username: suggestion })
      if (!exists) {
        availableSuggestions.push(suggestion)
        if (availableSuggestions.length >= 5) break // Limit to 5 suggestions
      }
    }

    return NextResponse.json({ 
      available: false, 
      suggestions: availableSuggestions
    })
  } catch (error) {
    console.error("Username check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Generate username suggestions based on the original username
function generateUsernameSuggestions(username: string): string[] {
  const suggestions = []
  
  // Add a random number
  suggestions.push(`${username}${Math.floor(Math.random() * 100)}`)
  suggestions.push(`${username}${Math.floor(Math.random() * 1000)}`)
  
  // Add the current year
  const currentYear = new Date().getFullYear()
  suggestions.push(`${username}${currentYear}`)
  
  // Add underscores or dots
  suggestions.push(`${username}_${Math.floor(Math.random() * 100)}`)
  suggestions.push(`${username}.${Math.floor(Math.random() * 100)}`)
  
  // Add common suffixes
  suggestions.push(`${username}_official`)
  suggestions.push(`real_${username}`)
  suggestions.push(`the_${username}`)
  
  // Try different alternatives
  const randomNum = Math.floor(Math.random() * 1000)
  suggestions.push(`${username}fan${randomNum}`)
  suggestions.push(`${username}lover`)
  
  return suggestions
} 