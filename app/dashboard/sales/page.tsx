"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { InvoiceStore, ProductStore, StockMovementStore, type Invoice } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Download } from "lucide-react"
import CreateInvoiceDialog from "@/components/create-invoice-dialog"
import { generateInvoicePDF } from "@/lib/pdf-generator"

export default function SalesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState(InvoiceStore.getAll())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateInvoice = (invoice: Invoice) => {
    InvoiceStore.create(invoice as Omit<Invoice, "id">)

    // Update product stock and create stock movements
    invoice.items.forEach((item) => {
      const product = ProductStore.getById(item.productId)
      if (product) {
        const newStock = product.stock - item.quantity

        StockMovementStore.create({
          productId: item.productId,
          productName: item.productName,
          type: "out",
          quantity: item.quantity,
          reason: `Sold to ${invoice.customerName} (Invoice: ${invoice.id})`,
          date: new Date(),
        })

        // Update product stock
        ProductStore.update(item.productId, {
          stock: newStock,
        })
      }
    })

    setInvoices(InvoiceStore.getAll())
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "outline"
      case "partial":
        return "secondary"
      default:
        return "outline"
    }
  }

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalProfit = invoices.reduce((sum, inv) => sum + inv.profit, 0)
  const paidAmount = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0)
  const totalCost = invoices.reduce((sum, inv) => sum + (inv.subtotal - inv.profit), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales & Invoicing</h1>
          <p className="text-muted-foreground">Create and manage customer invoices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          </DialogTrigger>
          <CreateInvoiceDialog
            onSave={handleCreateInvoice}
            onClose={() => setIsDialogOpen(false)}
            businessName={user?.businessName || "Your Business"}
          />
        </Dialog>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">From {invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCost.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">All purchases</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalProfit.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {totalSales > 0 ? `${((totalProfit / totalSales) * 100).toFixed(1)}%` : "0%"} margin
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paidAmount.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">₹{(totalSales - paidAmount).toFixed(0)} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const cost = invoice.subtotal - invoice.profit
              return (
                <TableRow key={invoice.id} className="border-border">
                  <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.customerType === "retail" ? "Retail" : "Wholesale"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{cost.toFixed(0)}</TableCell>
                  <TableCell className="text-right font-medium">₹{invoice.total.toFixed(0)}</TableCell>
                  <TableCell className="text-right text-primary font-medium">₹{invoice.profit.toFixed(0)}</TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invoice.status) as any}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => generateInvoicePDF(invoice)} className="gap-1">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {invoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No invoices yet. Create your first invoice.</p>
        </div>
      )}

      {/* Branding footer */}
      <div className="text-center text-xs text-muted-foreground pt-6 border-t border-border">
        Generated by RetailOS - Professional Retail Management System
      </div>
    </div>
  )
}
