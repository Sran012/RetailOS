"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ProductStore, CustomerStore, InvoiceStore } from "@/lib/data-store"
import { TrendingUp, Package, DollarSign, Users, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const products = ProductStore.getAll()
  const customers = CustomerStore.getAll()
  const invoices = InvoiceStore.getAll()

  // Calculate metrics
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock)
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const paidInvoices = invoices.filter((inv) => inv.status === "paid").length
  const avgProductStock = (products.reduce((sum, p) => sum + p.stock, 0) / Math.max(1, products.length)).toFixed(0)

  // Sales trend data (simulated)
  const salesTrendData = [
    { date: "Mon", retail: 2400, wholesale: 2210 },
    { date: "Tue", retail: 1398, wholesale: 2290 },
    { date: "Wed", retail: 9800, wholesale: 2000 },
    { date: "Thu", retail: 3908, wholesale: 2108 },
    { date: "Fri", retail: 4800, wholesale: 2176 },
    { date: "Sat", retail: 3800, wholesale: 2500 },
    { date: "Sun", retail: 4300, wholesale: 2100 },
  ]

  // Inventory distribution
  const inventoryData = products.slice(0, 5).map((p) => ({
    name: p.name.slice(0, 10),
    stock: p.stock,
  }))

  // Predicted stockouts (rule-based AI)
  const predictedStockouts = products
    .map((p) => {
      const daysToStockout = (p.stock - p.minStock) / Math.max(1, p.stock / 30)
      return { ...p, predictedStockoutDays: Math.max(0, Math.floor(daysToStockout)) }
    })
    .filter((p) => p.predictedStockoutDays < 7)
    .sort((a, b) => a.predictedStockoutDays - b.predictedStockoutDays)

  // Customer breakdown
  const retailCustomers = customers.filter((c) => c.type === "retail").length
  const wholesaleCustomers = customers.filter((c) => c.type === "wholesale").length

  return (
    <div className="space-y-6">
      {/* Alert for low stock */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {lowStockProducts.length} products are running low on stock. Review inventory.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From {invoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Avg stock: {avgProductStock} units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {retailCustomers} retail, {wholesaleCustomers} wholesale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length > 0 ? ((paidInvoices / invoices.length) * 100).toFixed(0) : 0}% payment rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Sales Trend</CardTitle>
            <CardDescription>Retail vs Wholesale sales comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="retail" stroke="hsl(var(--color-primary))" name="Retail" />
                <Line type="monotone" dataKey="wholesale" stroke="hsl(var(--color-secondary))" name="Wholesale" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Top Product Inventory</CardTitle>
            <CardDescription>Current stock levels by product</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="hsl(var(--color-accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Predicted Stockouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            AI Predicted Stockouts
          </CardTitle>
          <CardDescription>Products expected to hit minimum stock within 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {predictedStockouts.length > 0 ? (
            <div className="space-y-3">
              {predictedStockouts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">{product.predictedStockoutDays} days</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Current: {product.stock} units</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No stockouts predicted in the next 7 days</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
