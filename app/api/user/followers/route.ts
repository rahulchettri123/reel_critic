import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userIdentifier = url.searchParams.get('userId') || url.searchParams.get('username')
  
  if (!userIdentifier) {
    return NextResponse.json({ error: "User ID or username is required" }, { status: 400 })
  }

  try {
    const usersCollection = await getCollection("users")
    
    // First, find the target user to get their ID
    let targetUser;
    if (ObjectId.isValid(userIdentifier)) {
      targetUser = await usersCollection.findOne({ _id: new ObjectId(userIdentifier) });
    } else {
      targetUser = await usersCollection.findOne({ username: userIdentifier });
    }
    
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find users who follow the specified user (userId is in their following array)
    const followers = await usersCollection.find(
      { following: targetUser._id }
    ).project({
      _id: 1,
      name: 1,
      username: 1,
      avatar: 1,
      bio: 1,
      role: 1
    }).toArray()
    
    return NextResponse.json({ followers })
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 })
  }
} 