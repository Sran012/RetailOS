import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

function getUserId(request: NextRequest): number | null {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null
  const userId = Number.parseInt(token.replace("user-", ""))
  return isNaN(userId) ? null : userId
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, costPrice, retailPrice, wholesalePrice, stock, minStock, category } = await request.json()
    const productId = Number.parseInt(params.id)

    const result = await sql(
      `UPDATE products 
       SET name = $1, cost_price = $2, retail_price = $3, wholesale_price = $4, stock = $5, min_stock = $6, category = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING id, name, sku, cost_price, retail_price, wholesale_price, stock, min_stock, category, updated_at`,
      [name, costPrice, retailPrice, wholesalePrice, stock, minStock, category, productId, userId],
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0], { status: 200 })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id)

    await sql(`DELETE FROM products WHERE id = $1 AND user_id = $2`, [productId, userId])

    return NextResponse.json({ message: "Product deleted" }, { status: 200 })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
