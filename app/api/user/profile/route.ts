import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET user profile data
export async function GET(request: Request) {
  try {
    // Get userId or username from query params
    const { searchParams } = new URL(request.url)
    const userIdentifier = searchParams.get("userId") || searchParams.get("username")

    if (!userIdentifier) {
      return NextResponse.json({ error: "User ID or username is required" }, { status: 400 })
    }

    // Get user from database
    const usersCollection = await getCollection("users")
    
    // Check if the identifier is a valid ObjectId (user ID) or a username
    let query = {}
    try {
      // If it's a valid ObjectId, search by _id
      if (ObjectId.isValid(userIdentifier)) {
        query = { _id: new ObjectId(userIdentifier) }
      } else {
        // Otherwise, search by username
        query = { username: userIdentifier }
      }
    } catch (e) {
      // If there's an error parsing ObjectId, assume it's a username
      query = { username: userIdentifier }
    }
    
    const user = await usersCollection.findOne(query)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userProfile } = user

    // Get additional stats
    const reviewsCollection = await getCollection("reviews")
    
    // Get recent reviews
    const recentReviews = await reviewsCollection
      .find({ user: new ObjectId(user._id) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Count total reviews for accurate stats
    const reviewsCount = await reviewsCollection.countDocuments({ user: new ObjectId(user._id) })

    // Get review count by rating
    const ratingDistribution = await reviewsCollection.aggregate([
      { $match: { user: new ObjectId(user._id) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]).toArray()

    // Convert to more usable format
    const ratingStats = Array.from({ length: 5 }, (_, i) => {
      const entry = ratingDistribution.find(r => r._id === i + 1)
      return { rating: i + 1, count: entry ? entry.count : 0 }
    })

    // Calculate counts for accurate stats
    const favoritesCount = Array.isArray(userProfile.favorites) ? userProfile.favorites.length : 0
    const watchlistCount = Array.isArray(userProfile.watchlist) ? userProfile.watchlist.length : 0
    const followersCount = Array.isArray(userProfile.followers) ? userProfile.followers.length : 0
    const followingCount = Array.isArray(userProfile.following) ? userProfile.following.length : 0

    // Ensure stats object exists and update with accurate counts
    if (!userProfile.stats) {
      userProfile.stats = {}
    }

    // Update stats with accurate counts
    userProfile.stats = {
      ...userProfile.stats,
      reviewsCount,
      favoritesCount,
      watchlistCount,
      followersCount,
      followingCount
    }

    // Update user document with accurate stats if needed
    if (userProfile.stats.reviewsCount !== reviewsCount ||
        userProfile.stats.favoritesCount !== favoritesCount ||
        userProfile.stats.watchlistCount !== watchlistCount ||
        userProfile.stats.followersCount !== followersCount ||
        userProfile.stats.followingCount !== followingCount) {
      
      await usersCollection.updateOne(
        { _id: new ObjectId(user._id) },
        { 
          $set: { 
            stats: userProfile.stats,
            updatedAt: new Date()
          } 
        }
      )
    }

    // Return profile with additional data
    return NextResponse.json({
      profile: userProfile,
      recentActivity: {
        reviews: recentReviews,
        ratingStats
      }
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    try {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        console.error("JWT_SECRET environment variable is not set!")
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
      }
      
      const decoded = jwt.verify(token.value, jwtSecret) as { id: string }
      
      // Get user from database
      const usersCollection = await getCollection("users")
      const currentUser = await usersCollection.findOne({ _id: new ObjectId(decoded.id) })

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Get profile updates from request body
      const updates = await request.json()
      
      // List of allowed fields to update
      const allowedUpdates = [
        "name",
        "username",
        "bio",
        "location",
        "website",
        "avatar",
        "cover",
        "social",
        "preferences",
        "dateOfBirth"
      ]
      
      // Filter out disallowed fields
      const sanitizedUpdates = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key]
          return obj
        }, {} as Record<string, any>)
      
      // Make sure there are valid updates
      if (Object.keys(sanitizedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
      }

      // Check username uniqueness if being updated
      if (sanitizedUpdates.username && sanitizedUpdates.username !== currentUser.username) {
        const existingUser = await usersCollection.findOne({ 
          username: sanitizedUpdates.username,
          _id: { $ne: new ObjectId(decoded.id) } // Exclude current user
        })
        
        if (existingUser) {
          return NextResponse.json({ error: "Username already taken" }, { status: 400 })
        }
      }
      
      // Add updatedAt timestamp
      sanitizedUpdates.updatedAt = new Date()
      sanitizedUpdates.lastActive = new Date()
      
      // Update user document
      await usersCollection.updateOne(
        { _id: new ObjectId(decoded.id) },
        { $set: sanitizedUpdates }
      )
      
      // Get updated user
      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(decoded.id) })
      
      // Remove sensitive data
      const { password, ...userProfile } = updatedUser

      return NextResponse.json({
        message: "Profile updated successfully",
        profile: userProfile
      })
    } catch (tokenError) {
      console.error("Token verification error:", tokenError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 