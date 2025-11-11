import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

function getUserId(request: NextRequest): number | null {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null
  const userId = Number.parseInt(token.replace("user-", ""))
  return isNaN(userId) ? null : userId
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const invoiceId = Number.parseInt(params.id)

    const invoice = await sql(
      `SELECT id, business_name, customer_name, customer_type, subtotal, tax_amount, total, profit, status, due_date, created_at
       FROM invoices WHERE id = $1 AND user_id = $2`,
      [invoiceId, userId],
    )

    if (!invoice || invoice.length === 0) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    const items = await sql(
      `SELECT id, product_id, product_name, quantity, cost_price, sale_price, profit
       FROM invoice_items WHERE invoice_id = $1`,
      [invoiceId],
    )

    return NextResponse.json({ ...invoice[0], items }, { status: 200 })
  } catch (error) {
    console.error("Get invoice error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const invoiceId = Number.parseInt(params.id)

    const result = await sql(
      `UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3
       RETURNING id, business_name, customer_name, customer_type, subtotal, tax_amount, total, profit, status, due_date, updated_at`,
      [status, invoiceId, userId],
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(result[0], { status: 200 })
  } catch (error) {
    console.error("Update invoice error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
