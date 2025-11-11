"use client"

import type React from "react"

import { useState } from "react"
import { ProductStore, StockMovementStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"

export default function InventoryPage() {
  const products = ProductStore.getAll()
  const movements = StockMovementStore.getAll()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [movementType, setMovementType] = useState<"in" | "out">("in")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProductId || !quantity || !reason) return

    const product = ProductStore.getById(selectedProductId)
    if (!product) return

    const qty = Number.parseInt(quantity)
    const newStock = movementType === "in" ? product.stock + qty : Math.max(0, product.stock - qty)

    ProductStore.update(selectedProductId, { stock: newStock })
    StockMovementStore.create({
      productId: selectedProductId,
      type: movementType,
      quantity: qty,
      reason,
      date: new Date(),
    })

    // Reset form
    setSelectedProductId("")
    setQuantity("")
    setReason("")
    setIsDialogOpen(false)
  }

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock)
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock movements and levels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Record Movement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Stock Movement</DialogTitle>
              <DialogDescription>Add or remove stock from inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRecordMovement} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Current: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Movement Type</Label>
                <Select value={movementType} onValueChange={(value) => setMovementType(value as "in" | "out")}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Purchase order, Damage, Return"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Movement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements
                .slice(-10)
                .reverse()
                .map((movement) => {
                  const product = ProductStore.getById(movement.productId)
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{product?.name}</TableCell>
                      <TableCell>
                        <Badge variant={movement.type === "in" ? "default" : "outline"}>
                          {movement.type === "in" ? "Stock In" : "Stock Out"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{movement.quantity}</TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
