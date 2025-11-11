import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

function getUserId(request: NextRequest): number | null {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null
  const userId = Number.parseInt(token.replace("user-", ""))
  return isNaN(userId) ? null : userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const movements = await sql(
      `SELECT id, product_id, product_name, type, quantity, reason, created_at
       FROM stock_movements WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )

    return NextResponse.json(movements, { status: 200 })
  } catch (error) {
    console.error("Get stock movements error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { productId, productName, type, quantity, reason } = await request.json()

    // Record stock movement
    const result = await sql(
      `INSERT INTO stock_movements (user_id, product_id, product_name, type, quantity, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, product_id, product_name, type, quantity, reason, created_at`,
      [userId, productId, productName, type, quantity, reason],
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Failed to record stock movement" }, { status: 500 })
    }

    // Update product stock
    const operation = type === "in" ? "+" : "-"
    await sql(`UPDATE products SET stock = stock ${operation} $1 WHERE id = $2 AND user_id = $3`, [
      quantity,
      productId,
      userId,
    ])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Create stock movement error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
