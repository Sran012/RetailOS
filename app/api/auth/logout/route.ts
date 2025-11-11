import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.delete("auth-token")
  return response
}
