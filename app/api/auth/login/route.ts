import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple demo authentication
    if (email === "demo@example.com" && password === "demo123") {
      const user = {
        id: "1",
        email: "demo@example.com",
        name: "Demo User",
        role: "admin" as const,
      }

      const response = NextResponse.json({ user }, { status: 200 })
      response.cookies.set("auth-token", "demo-token-123", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      })

      return response
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
