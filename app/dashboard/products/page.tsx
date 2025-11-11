"use client"

import { useState } from "react"
import { ProductStore, type Product } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import ProductFormDialog from "@/components/product-form-dialog"

export default function ProductsPage() {
  const [products, setProducts] = useState(ProductStore.getAll())
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState("")

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    setEditingProduct(null)
    setError("")
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setError("")
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    ProductStore.delete(id)
    setProducts(ProductStore.getAll())
  }

  const handleSave = (product: Product) => {
    try {
      if (editingProduct) {
        ProductStore.update(editingProduct.id, product)
      } else {
        ProductStore.create(product as Omit<Product, "id">)
      }
      setProducts(ProductStore.getAll())
      setIsDialogOpen(false)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product")
    }
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { label: "Low Stock", variant: "destructive" as const }
    if (stock <= minStock * 1.5) return { label: "Warning", variant: "outline" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2 w-full md:w-auto">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </DialogTrigger>
          <ProductFormDialog
            product={editingProduct}
            onSave={handleSave}
            onOpenChange={setIsDialogOpen}
            error={error}
          />
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Retail Price</TableHead>
              <TableHead className="text-right">Wholesale Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.stock || 0, product.minStock || 0)
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name || "N/A"}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku || "N/A"}</TableCell>
                  <TableCell>{product.category || "N/A"}</TableCell>
                  <TableCell className="text-right">₹{(product.costPrice ?? 0).toFixed(0)}</TableCell>
                  <TableCell className="text-right">₹{(product.retailPrice ?? 0).toFixed(0)}</TableCell>
                  <TableCell className="text-right">₹{(product.wholesalePrice ?? 0).toFixed(0)}</TableCell>
                  <TableCell className="text-right font-medium">{product.stock || 0}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {products.length === 0 ? "No products yet. Create your first product." : "No products found"}
          </p>
        </div>
      )}

      {/* Branding footer */}
      <div className="text-center text-xs text-muted-foreground pt-6 border-t border-border">
        Generated by RetailOS - Professional Retail Management System
      </div>
    </div>
  )
}
