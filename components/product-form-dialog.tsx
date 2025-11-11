"use client"

import type React from "react"
import { useState } from "react"
import type { Product } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProductFormDialogProps {
  product: Product | null
  onSave: (product: Product) => void
  onOpenChange: (open: boolean) => void
  error?: string
}

export default function ProductFormDialog({ product, onSave, onOpenChange, error }: ProductFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Product, "id">>(
    product || {
      name: "",
      sku: "",
      costPrice: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      stock: 0,
      minStock: 0,
      category: "",
      createdAt: new Date(),
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: product?.id || "",
      ...formData,
    } as Product)
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>
          {product ? "Update product details" : "Create a new product with retail and wholesale pricing"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Boat Earbuds"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g., BOAT-001"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Electronics"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (₹)</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retailPrice">Retail Price (₹)</Label>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              value={formData.retailPrice}
              onChange={(e) => setFormData({ ...formData, retailPrice: Number.parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wholesalePrice">Wholesale Price (₹)</Label>
            <Input
              id="wholesalePrice"
              type="number"
              step="0.01"
              value={formData.wholesalePrice}
              onChange={(e) => setFormData({ ...formData, wholesalePrice: Number.parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Current Stock</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStock">Minimum Stock</Label>
            <Input
              id="minStock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">{product ? "Update" : "Create"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
