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

    const products = await sql(
      `SELECT id, name, sku, cost_price, retail_price, wholesale_price, stock, min_stock, category, created_at 
       FROM products WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, sku, costPrice, retailPrice, wholesalePrice, stock, minStock, category } = await request.json()

    const result = await sql(
      `INSERT INTO products (user_id, name, sku, cost_price, retail_price, wholesale_price, stock, min_stock, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, sku, cost_price, retail_price, wholesale_price, stock, min_stock, category, created_at`,
      [userId, name, sku, costPrice, retailPrice, wholesalePrice, stock, minStock, category],
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    if ((error as any).message?.includes("duplicate key")) {
      return NextResponse.json({ message: "Product already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
