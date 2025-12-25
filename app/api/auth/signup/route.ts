import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, businessName } = await request.json()

    if (!email || !password || !name || !businessName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Hash password
    const salt = process.env.SALT || "default-salt"
    const passwordHash = crypto.createHash("sha256").update(password + salt).digest("hex")

    // Create user in database using Neon's tagged template literal syntax
    const result = await sql`
      INSERT INTO users (email, password_hash, name, business_name) 
      VALUES (${email}, ${passwordHash}, ${name}, ${businessName}) 
      RETURNING id, email, name, business_name
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    const user = result[0]

    const response = NextResponse.json(
      { user: { id: user.id.toString(), email: user.email, name: user.name, businessName: user.business_name } },
      { status: 201 },
    )

    // Set auth token cookie
    response.cookies.set("auth-token", `user-${user.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    if ((error as any).message?.includes("duplicate key") || (error as any).code === "23505") {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
