import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    // Get the form data
    const data = await request.json()
    const { name, email, subject, message } = data
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }
    
    // Store the contact message in MongoDB
    const contactCollection = await getCollection("contact_messages")
    
    const contactMessage = {
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      status: "unread",
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await contactCollection.insertOne(contactMessage)
    
    if (!result.insertedId) {
      throw new Error("Failed to store contact message")
    }
    
    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving contact message:", error)
    return NextResponse.json(
      { error: "An error occurred while sending your message. Please try again later." },
      { status: 500 }
    )
  }
} 