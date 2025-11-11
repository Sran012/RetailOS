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

    const salesData = await sql(
      `SELECT DATE(created_at) as date, SUM(total) as total_sales, SUM(profit) as total_profit, COUNT(*) as invoice_count
       FROM invoices WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) ORDER BY date DESC`,
      [userId],
    )

    const profitByProduct = await sql(
      `SELECT ii.product_name, SUM(ii.profit) as total_profit, COUNT(*) as sales_count
       FROM invoice_items ii
       JOIN invoices i ON ii.invoice_id = i.id
       WHERE i.user_id = $1
       GROUP BY ii.product_name ORDER BY total_profit DESC`,
      [userId],
    )

    const lowStockProducts = await sql(
      `SELECT id, name, stock, min_stock FROM products WHERE user_id = $1 AND stock <= min_stock`,
      [userId],
    )

    return NextResponse.json({ salesData, profitByProduct, lowStockProducts }, { status: 200 })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
