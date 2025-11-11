import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  // Return demo user
  const user = {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
    role: "admin",
  }

  return NextResponse.json({ user }, { status: 200 })
}
