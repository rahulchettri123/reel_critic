import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const skip = parseInt(searchParams.get("skip") || "0", 10)
    
    // Get users collection
    const usersCollection = await getCollection("users")
    
    // Find users with basic info and calculated stats
    const usersAggregation = await usersCollection.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          avatar: 1,
          bio: 1,
          createdAt: 1,
          favorites: 1,
          watchlist: 1,
          updatedAt: 1
        }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "user._id",
          as: "reviews"
        }
      },
      {
        $lookup: {
          from: "followers",
          localField: "_id",
          foreignField: "followedId",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "followers",
          localField: "_id",
          foreignField: "followerId",
          as: "following"
        }
      },
      {
        $addFields: {
          "stats.reviewsCount": { $size: "$reviews" },
          "stats.followersCount": { $size: "$followers" },
          "stats.followingCount": { $size: "$following" }
        }
      },
      {
        $project: {
          reviews: 0,  // Remove the full reviews array
          followers: 0, // Remove the full followers array
          following: 0, // Remove the full following array
          password: 0,  // Ensure password is not included
          email: 0,     // Don't expose emails
          favorites: 0, // Don't need these for the list
          watchlist: 0  // Don't need these for the list
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray()
    
    // Count total users for pagination
    const totalUsers = await usersCollection.countDocuments()
    
    return NextResponse.json({ 
      users: usersAggregation,
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