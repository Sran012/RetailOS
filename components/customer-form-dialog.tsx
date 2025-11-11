"use client"

import type React from "react"

import { useState } from "react"
import type { Customer } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

interface CustomerFormDialogProps {
  customer: Customer | null
  onSave: (customer: Customer) => void
  onOpenChange: (open: boolean) => void
}

export default function CustomerFormDialog({ customer, onSave, onOpenChange }: CustomerFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Customer, "id">>(
    customer || {
      name: "",
      type: "retail",
      email: "",
      phone: "",
      address: "",
      totalPurchases: 0,
      credit: 0,
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: customer?.id || "",
      ...formData,
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        <DialogDescription>
          {customer ? "Update customer information" : "Create a new retail or wholesale customer"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Customer Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as "retail" | "wholesale" })}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="credit">Credit Limit ($)</Label>
            <Input
              id="credit"
              type="number"
              step="0.01"
              value={formData.credit}
              onChange={(e) => setFormData({ ...formData, credit: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">{customer ? "Update" : "Create"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
