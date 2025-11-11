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

    const invoices = await sql(
      `SELECT id, business_name, customer_name, customer_type, subtotal, tax_amount, total, profit, status, due_date, created_at
       FROM invoices WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )

    return NextResponse.json(invoices, { status: 200 })
  } catch (error) {
    console.error("Get invoices error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { businessName, customerName, customerType, items, subtotal, taxAmount, total, profit, dueDate } =
      await request.json()

    // Create invoice
    const invoiceResult = await sql(
      `INSERT INTO invoices (user_id, business_name, customer_name, customer_type, subtotal, tax_amount, total, profit, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING id, business_name, customer_name, customer_type, subtotal, tax_amount, total, profit, status, due_date, created_at`,
      [userId, businessName, customerName, customerType, subtotal, taxAmount, total, profit, dueDate],
    )

    if (!invoiceResult || invoiceResult.length === 0) {
      return NextResponse.json({ message: "Failed to create invoice" }, { status: 500 })
    }

    const invoice = invoiceResult[0]

    // Create invoice items and update stock
    for (const item of items) {
      await sql(
        `INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, cost_price, sale_price, profit)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [invoice.id, item.productId, item.productName, item.quantity, item.costPrice, item.salePrice, item.profit],
      )

      // Decrease product stock
      await sql(`UPDATE products SET stock = stock - $1 WHERE id = $2 AND user_id = $3`, [
        item.quantity,
        item.productId,
        userId,
      ])

      // Record stock movement
      await sql(
        `INSERT INTO stock_movements (user_id, product_id, product_name, type, quantity, reason)
         VALUES ($1, $2, $3, 'out', $4, $5)`,
        [userId, item.productId, item.productName, item.quantity, `Invoice #INV-${invoice.id}`],
      )
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Create invoice error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
