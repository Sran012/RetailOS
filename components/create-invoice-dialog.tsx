"use client"

import { useState } from "react"
import { ProductStore, type Invoice, type InvoiceItem } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Download } from 'lucide-react'
import { generateInvoicePDF } from "@/lib/pdf-generator"

interface CreateInvoiceDialogProps {
  onSave: (invoice: Invoice) => void
  onClose: () => void
  businessName: string
}

export default function CreateInvoiceDialog({ onSave, onClose, businessName }: CreateInvoiceDialogProps) {
  const products = ProductStore.getAll()

  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [taxPercent, setTaxPercent] = useState("0")
  const [error, setError] = useState("")

  const selectedProduct = selectedProductId ? ProductStore.getById(selectedProductId) : null

  const addItem = () => {
    if (!selectedProductId || !quantity) {
      setError("Please select a product and quantity")
      return
    }

    const product = ProductStore.getById(selectedProductId)
    if (!product) {
      setError("Product not found")
      return
    }

    const qty = Number.parseInt(quantity)
    if (qty <= 0) {
      setError("Quantity must be greater than 0")
      return
    }

    if (qty > product.stock) {
      setError(`Insufficient stock. Available: ${product.stock}`)
      return
    }

    setError("")

    // Check if product already in items
    const existingItem = items.find((item) => item.productId === selectedProductId)
    if (existingItem) {
      const newQty = existingItem.quantity + qty
      if (newQty > product.stock) {
        setError(`Insufficient stock. Available: ${product.stock}`)
        return
      }
      // Update quantity instead of adding duplicate
      setItems(items.map((item) => (item.productId === selectedProductId ? { ...item, quantity: newQty } : item)))
    } else {
      const salePrice = product.retailPrice
      const profit = salePrice - product.costPrice

      setItems([
        ...items,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          costPrice: product.costPrice,
          salePrice,
          profit,
        },
      ])
    }

    setSelectedProductId("")
    setQuantity("1")
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
  const taxAmount = (subtotal * Number.parseFloat(taxPercent || "0")) / 100
  const total = subtotal + taxAmount
  const totalProfit = items.reduce((sum, item) => sum + item.profit * item.quantity, 0)

  const handleDownloadPDF = async () => {
    if (!customerName || items.length === 0) {
      setError("Please enter customer name and add items")
      return
    }

    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      businessName,
      customerName,
      customerType: "retail",
      items: items.map((item) => ({
        ...item,
        profit: 0,
      })),
      subtotal,
      taxAmount,
      total,
      profit: 0,
      status: "pending",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }

    await generateInvoicePDF(invoice)
  }

  const handleSubmit = () => {
    if (!customerName || items.length === 0) {
      setError("Please enter customer name and add items")
      return
    }

    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      businessName,
      customerName,
      customerType: "retail",
      items,
      subtotal,
      taxAmount,
      total,
      profit: totalProfit,
      status: "pending",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }

    onSave(invoice)
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogDescription>Generate invoice for {businessName}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Customer Section */}
        <Card className="bg-muted/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <div className="space-y-2">
          <Label>Add Items</Label>
          <div className="flex gap-2">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No products available
                  </SelectItem>
                ) : (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - Stock: {product.stock}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty"
              className="w-20"
            />
            <Button onClick={addItem} className="bg-primary hover:bg-primary/90">
              Add
            </Button>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm">Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item, index) => {
                  const itemTotal = item.salePrice * item.quantity
                  const itemProfit = item.profit * item.quantity

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Cost: ₹{item.costPrice} | Sale: ₹{item.salePrice} | Profit: ₹{item.profit} per unit
                        </p>
                        <p className="text-xs text-primary font-medium">
                          {item.quantity} × ₹{item.salePrice} = ₹{itemTotal.toFixed(2)} | Total Profit: ₹
                          {itemProfit.toFixed(2)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>

              {/* Tax and Totals */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="tax" className="w-20">
                    Tax %:
                  </Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-24"
                  />
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-medium">Total:</span>
                  <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-accent">Total Profit:</span>
                  <span className="text-2xl font-bold text-accent">₹{totalProfit.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={items.length === 0 || !customerName}
            className="gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!customerName || items.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              Save Invoice
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
