import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(token.replace("user-", ""))
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Query user from database
    const result = await sql`
      SELECT id, email, name, business_name 
      FROM users 
      WHERE id = ${userId}
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = result[0]
    return NextResponse.json(
      {
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          businessName: user.business_name,
          role: "admin" as const,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
