import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, businessName } = await request.json()

    // Simple demo signup
    const user = {
      id: Date.now().toString(),
      email,
      name,
      businessName,
      role: "admin" as const,
    }

    const response = NextResponse.json({ user }, { status: 200 })
    response.cookies.set("auth-token", `token-${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
