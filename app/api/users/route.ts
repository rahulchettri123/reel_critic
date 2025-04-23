import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const skip = parseInt(searchParams.get("skip") || "0", 10)
    
    // Get users collection
    const usersCollection = await getCollection("users")
    
    // Find users with basic info
    const users = await usersCollection.find({}, {
      projection: {
        _id: 1,
        name: 1,
        username: 1,
        avatar: 1,
        bio: 1,
        createdAt: 1,
        followers: 1,
        following: 1,
        stats: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
    
    // Get reviews collection
    const reviewsCollection = await getCollection("reviews");
    
    // Process each user to ensure stats are properly calculated
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Count reviews for this user
      const reviewsCount = await reviewsCollection.countDocuments({ 
        "user": new ObjectId(user._id)
      });
      
      // Count followers if the array exists, otherwise default to 0
      const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
      
      // Count following if the array exists, otherwise default to 0
      const followingCount = Array.isArray(user.following) ? user.following.length : 0;
      
      // Create or update the stats object
      const stats = {
        reviewsCount,
        followersCount,
        followingCount
      };
      
      // Return the user with updated stats
      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        stats
      };
    }));
    
    // Count total users for pagination
    const totalUsers = await usersCollection.countDocuments()
    
    return NextResponse.json({ 
      users: usersWithStats,
      pagination: {
        total: totalUsers,
        limit,
        skip
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    )
  }
} 