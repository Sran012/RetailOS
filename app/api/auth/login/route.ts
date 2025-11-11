import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Missing email or password" }, { status: 400 })
    }

    // Hash password
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + process.env.SALT || "default")
      .digest("hex")

    // Find user in database
    const result = await sql(
      `SELECT id, email, name, business_name FROM users WHERE email = $1 AND password_hash = $2`,
      [email, passwordHash],
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = result[0]

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, businessName: user.business_name } },
      { status: 200 },
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
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
