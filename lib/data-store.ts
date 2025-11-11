// In-memory data store for the application
export interface Product {
  id: string
  name: string
  sku: string
  costPrice: number
  retailPrice: number
  wholesalePrice: number
  stock: number
  minStock: number
  category: string
  createdAt: Date
}

export interface Invoice {
  id: string
  businessName: string
  customerName: string
  customerType: "retail" | "wholesale"
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  profit: number
  status: "paid" | "pending" | "partial"
  createdAt: Date
  dueDate: Date
}

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  costPrice: number
  salePrice: number
  profit: number
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "in" | "out"
  quantity: number
  reason: string
  date: Date
}

export interface Customer {
  id: string
  name: string
  type: "retail" | "wholesale"
  email: string
  phone: string
  address: string
  totalPurchases: number
  credit: number
}

let products: Product[] = []
const customers: Customer[] = []
const invoices: Invoice[] = []
const stockMovements: StockMovement[] = []

export const CustomerStore = {
  getAll: () => customers,
  getById: (id: string) => customers.find((c) => c.id === id),
  create: (customer: Omit<Customer, "id">) => {
    const newCustomer = { ...customer, id: Date.now().toString() }
    customers.push(newCustomer)
    return newCustomer
  },
  update: (id: string, updates: Partial<Customer>) => {
    const index = customers.findIndex((c) => c.id === id)
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates }
      return customers[index]
    }
    return null
  },
}

export const ProductStore = {
  getAll: () => products,
  getById: (id: string) => products.find((p) => p.id === id),
  getByName: (name: string) => products.find((p) => p.name.toLowerCase() === name.toLowerCase()),
  getByProductName: (name: string) => {
    // Case-insensitive search for product by name
    return products.find((p) => p.name.toLowerCase() === name.toLowerCase())
  },
  create: (product: Omit<Product, "id" | "createdAt">) => {
    const existing = ProductStore.getByName(product.name)
    if (existing) {
      throw new Error(`Product "${product.name}" already exists. Please use a different name.`)
    }
    const newProduct = {
      ...product,
      id: `PRD-${Date.now()}`,
      createdAt: new Date(),
    }
    products.push(newProduct)
    return newProduct
  },
  update: (id: string, updates: Partial<Product>) => {
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      if (updates.name && updates.name !== products[index].name) {
        const existing = ProductStore.getByName(updates.name)
        if (existing) {
          throw new Error(`Product "${updates.name}" already exists. Please use a different name.`)
        }
      }
      products[index] = { ...products[index], ...updates }
      return products[index]
    }
    return null
  },
  delete: (id: string) => {
    products = products.filter((p) => p.id !== id)
  },
}

export const InvoiceStore = {
  getAll: () => invoices,
  getById: (id: string) => invoices.find((i) => i.id === id),
  create: (invoice: Omit<Invoice, "id">) => {
    const newInvoice = { ...invoice, id: `INV-${Date.now()}` }
    invoices.push(newInvoice)
    return newInvoice
  },
  updateStatus: (id: string, status: Invoice["status"]) => {
    const invoice = invoices.find((i) => i.id === id)
    if (invoice) {
      invoice.status = status
    }
    return invoice
  },
}

export const StockMovementStore = {
  getAll: () => stockMovements,
  getByProduct: (productId: string) => stockMovements.filter((m) => m.productId === productId),
  create: (movement: Omit<StockMovement, "id">) => {
    const newMovement = { ...movement, id: `SM-${Date.now()}` }
    stockMovements.push(newMovement)
    return newMovement
  },
  getProductHistory: (productId: string) => {
    return stockMovements
      .filter((m) => m.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
}
