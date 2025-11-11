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
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + process.env.SALT || "default")
      .digest("hex")

    // Create user in database
    const result = await sql(
      `INSERT INTO users (email, password_hash, name, business_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, business_name`,
      [email, passwordHash, name, businessName],
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    const user = result[0]

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, businessName: user.business_name } },
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
    if ((error as any).message?.includes("duplicate key")) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
