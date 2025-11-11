import type { Invoice } from "@/lib/data-store"

export async function generateInvoicePDF(invoice: Invoice) {
  const doc = document.createElement("html")
  doc.lang = "en"

  const head = document.createElement("head")
  const meta = document.createElement("meta")
  meta.setAttribute("charset", "UTF-8")
  head.appendChild(meta)

  const style = document.createElement("style")
  const cssText =
    "body { font-family: Arial, sans-serif; margin: 20px; color: #1a1a1a; background: #fff; } " +
    ".container { max-width: 900px; margin: 0 auto; } " +
    ".header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff8c42; padding-bottom: 20px; } " +
    ".business-name { font-size: 28px; font-weight: bold; color: #ff8c42; margin-bottom: 5px; } " +
    ".branding { font-size: 11px; color: #666; margin-top: 8px; } " +
    ".invoice-title { font-size: 18px; font-weight: bold; margin: 25px 0 15px 0; } " +
    ".invoice-info { margin-bottom: 25px; } " +
    ".info-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; } " +
    ".info-label { font-weight: bold; min-width: 120px; } " +
    "table { width: 100%; border-collapse: collapse; margin: 20px 0; } " +
    "th { background-color: #ff8c42; color: white; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; } " +
    "td { border-bottom: 1px solid #ddd; padding: 10px; font-size: 12px; } " +
    ".totals { margin: 25px 0; } " +
    ".total-row { display: flex; justify-content: flex-end; margin: 8px 0; gap: 80px; font-size: 13px; } " +
    ".total-label { font-weight: bold; min-width: 120px; text-align: right; } " +
    ".total-amount { font-weight: bold; min-width: 100px; text-align: right; } " +
    ".profit { color: #4caf50; font-weight: 600; } " +
    ".footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }"
  style.textContent = cssText
  head.appendChild(style)
  doc.appendChild(head)

  const body = document.createElement("body")

  const container = document.createElement("div")
  container.className = "container"

  // Header
  const header = document.createElement("div")
  header.className = "header"

  const businessName = document.createElement("div")
  businessName.className = "business-name"
  businessName.textContent = invoice.businessName

  const branding = document.createElement("div")
  branding.className = "branding"
  branding.textContent = "Professional Retail Management System - RetailOS"

  header.appendChild(businessName)
  header.appendChild(branding)
  container.appendChild(header)

  // Invoice Title
  const title = document.createElement("div")
  title.className = "invoice-title"
  title.textContent = "INVOICE"
  container.appendChild(title)

  // Invoice Info
  const info = document.createElement("div")
  info.className = "invoice-info"

  const infoRow1 = document.createElement("div")
  infoRow1.className = "info-row"

  const infoPart1a = document.createElement("div")
  const label1a = document.createElement("span")
  label1a.className = "info-label"
  label1a.textContent = "Invoice #:"
  infoPart1a.appendChild(label1a)
  infoPart1a.appendChild(document.createTextNode(" " + invoice.id))

  const infoPart1b = document.createElement("div")
  const label1b = document.createElement("span")
  label1b.className = "info-label"
  label1b.textContent = "Date:"
  infoPart1b.appendChild(label1b)
  infoPart1b.appendChild(document.createTextNode(" " + new Date(invoice.createdAt).toLocaleDateString("en-IN")))

  infoRow1.appendChild(infoPart1a)
  infoRow1.appendChild(infoPart1b)
  info.appendChild(infoRow1)

  const infoRow2 = document.createElement("div")
  infoRow2.className = "info-row"

  const infoPart2a = document.createElement("div")
  const label2a = document.createElement("span")
  label2a.className = "info-label"
  label2a.textContent = "Customer:"
  infoPart2a.appendChild(label2a)
  infoPart2a.appendChild(document.createTextNode(" " + invoice.customerName))

  const infoPart2b = document.createElement("div")
  const label2b = document.createElement("span")
  label2b.className = "info-label"
  label2b.textContent = "Due Date:"
  infoPart2b.appendChild(label2b)
  infoPart2b.appendChild(document.createTextNode(" " + new Date(invoice.dueDate).toLocaleDateString("en-IN")))

  infoRow2.appendChild(infoPart2a)
  infoRow2.appendChild(infoPart2b)
  info.appendChild(infoRow2)

  container.appendChild(info)

  // Table
  const table = document.createElement("table")
  const thead = document.createElement("thead")
  const headerRow = document.createElement("tr")

  const headers = ["Product", "Qty", "Cost Price (₹)", "Sale Price (₹)", "Amount (₹)", "Profit (₹)"]
  headers.forEach((headerText) => {
    const th = document.createElement("th")
    th.textContent = headerText
    headerRow.appendChild(th)
  })
  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = document.createElement("tbody")
  invoice.items.forEach((item) => {
    const row = document.createElement("tr")

    const cells = [
      item.productName,
      item.quantity.toString(),
      "₹" + item.costPrice.toFixed(2),
      "₹" + item.salePrice.toFixed(2),
      "₹" + (item.salePrice * item.quantity).toFixed(2),
      "₹" + (item.profit * item.quantity).toFixed(2),
    ]

    cells.forEach((cellText, index) => {
      const td = document.createElement("td")
      td.textContent = cellText
      if (index === cells.length - 1) {
        td.className = "profit"
      }
      row.appendChild(td)
    })

    tbody.appendChild(row)
  })

  table.appendChild(tbody)
  container.appendChild(table)

  // Totals
  const totals = document.createElement("div")
  totals.className = "totals"

  const taxPercent = invoice.subtotal > 0 ? ((invoice.taxAmount / invoice.subtotal) * 100).toFixed(1) : "0"

  const totalRows = [
    {
      label: "Subtotal:",
      value: "₹" + invoice.subtotal.toFixed(2),
      style: "",
    },
    {
      label: "Tax (" + taxPercent + "%)",
      value: "₹" + invoice.taxAmount.toFixed(2),
      style: "",
    },
    {
      label: "Total Amount:",
      value: "₹" + invoice.total.toFixed(2),
      style: "border-top: 2px solid #ff8c42; padding-top: 10px; margin-top: 10px;",
    },
    {
      label: "Total Profit:",
      value: "₹" + invoice.profit.toFixed(2),
      style: "",
      isProfit: true,
    },
  ]

  totalRows.forEach((row) => {
    const div = document.createElement("div")
    div.className = "total-row"
    if (row.style) {
      div.setAttribute("style", row.style)
    }

    const label = document.createElement("span")
    label.className = "total-label"
    if (row.isProfit) {
      label.className += " profit"
    }
    label.textContent = row.label

    const value = document.createElement("span")
    value.className = "total-amount"
    if (row.isProfit) {
      value.className += " profit"
    }
    value.textContent = row.value

    div.appendChild(label)
    div.appendChild(value)
    totals.appendChild(div)
  })

  container.appendChild(totals)

  // Footer
  const footer = document.createElement("div")
  footer.className = "footer"

  const footerP1 = document.createElement("p")
  footerP1.textContent = "Generated by RetailOS - Professional Retail Management System"
  footer.appendChild(footerP1)

  const footerP2 = document.createElement("p")
  footerP2.textContent = "Thank you for your business!"
  footer.appendChild(footerP2)

  container.appendChild(footer)
  body.appendChild(container)
  doc.appendChild(body)

  // Convert to HTML string and download
  const html = "<!DOCTYPE html>" + doc.outerHTML

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "Invoice-" + invoice.id + ".html"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
