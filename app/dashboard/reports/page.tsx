"use client"

import { useMemo, useState } from "react"
import { ProductStore, CustomerStore, InvoiceStore } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  const products = ProductStore.getAll()
  const customers = CustomerStore.getAll()
  const invoices = InvoiceStore.getAll()

  const filteredInvoices = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt)
      return invDate >= start && invDate <= end
    })
  }, [invoices, startDate, endDate])

  const profitAnalysis = useMemo(() => {
    return products.map((product) => {
      const margin = product.retailPrice - product.wholesalePrice
      const marginPercent = (margin / product.retailPrice) * 100
      return {
        name: product.name.slice(0, 12),
        margin: margin.toFixed(2),
        marginPercent: marginPercent.toFixed(1),
      }
    })
  }, [])

  const inventoryTurnover = useMemo(() => {
    return products.map((product) => {
      const turnoverScore = ((product.minStock / product.stock) * 100).toFixed(0)
      const estimatedTurns = (30 / Math.max(1, Number.parseInt(turnoverScore))).toFixed(1)
      return {
        name: product.name.slice(0, 10),
        turns: Number.parseFloat(estimatedTurns),
        stock: product.stock,
      }
    })
  }, [])

  const salesForecast = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const dayOfWeek = date.getDay()

      const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0
      const trend = 5000 + Math.random() * 3000 * dayMultiplier
      const wholesale = 8000 + Math.random() * 4000 * dayMultiplier

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        retail: Math.round(trend),
        wholesale: Math.round(wholesale),
      }
    })
  }, [])

  const customerSegments = useMemo(() => {
    const retail = customers.filter((c) => c.type === "retail")
    const wholesale = customers.filter((c) => c.type === "wholesale")

    return [
      {
        name: "Retail",
        value: retail.reduce((sum, c) => sum + c.totalPurchases, 0),
        count: retail.length,
      },
      {
        name: "Wholesale",
        value: wholesale.reduce((sum, c) => sum + c.totalPurchases, 0),
        count: wholesale.length,
      },
    ]
  }, [])

  const demandTrends = useMemo(() => {
    return products
      .map((product) => {
        const stockHealth = (product.stock / (product.minStock * 3)) * 100
        const trendDirection = stockHealth > 100 ? "up" : "down"
        const trendPercent = Math.abs(100 - stockHealth).toFixed(1)

        return {
          product: product.name,
          trend: trendDirection,
          percent: Number.parseFloat(trendPercent),
          sku: product.sku,
        }
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5)
  }, [])

  const colors = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"]

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const avgOrderValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0
  const totalProfit = products.reduce((sum, p) => sum + (p.retailPrice - p.wholesalePrice) * 0.7, 0)
  const profitMargin = ((totalProfit / Math.max(1, totalRevenue)) * 100).toFixed(1)

  const advancedPredictions = useMemo(() => {
    const now = new Date()
    const invoicesByDay: Record<string, number[]> = {}

    filteredInvoices.forEach((inv) => {
      const date = new Date(inv.createdAt)
      const dayOfWeek = date.getDay().toString()
      if (!invoicesByDay[dayOfWeek]) invoicesByDay[dayOfWeek] = []
      invoicesByDay[dayOfWeek].push(inv.total)
    })

    const dayStats = Object.entries(invoicesByDay).map(([day, values]) => ({
      day: Number.parseInt(day),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      std: Math.sqrt(
        values.reduce((sq, n) => sq + Math.pow(n - values.reduce((a, b) => a + b, 0) / values.length, 2), 0) /
          values.length,
      ),
    }))

    const forecast = Array.from({ length: 90 }, (_, i) => {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const dayOfWeek = date.getDay()
      const dayStats_ = dayStats.find((d) => d.day === dayOfWeek)

      const baseValue = dayStats_ ? dayStats_.avg : 5000
      const variance = dayStats_ ? dayStats_.std * 0.5 : 1000
      const trend = 1 + (i / 90) * 0.15
      const noise = (Math.random() - 0.5) * 2 * variance

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dateObj: date,
        forecast: Math.round(Math.max(0, baseValue * trend + noise)),
        lower: Math.round(Math.max(0, baseValue * trend * 0.8)),
        upper: Math.round(baseValue * trend * 1.2),
      }
    })

    return forecast
  }, [filteredInvoices])

  const customerPredictions = useMemo(() => {
    return customers
      .map((customer) => {
        const customerInvoices = filteredInvoices.filter((i) => i.customerId === customer.id)
        const avgOrderValue =
          customerInvoices.length > 0
            ? customerInvoices.reduce((sum, i) => sum + i.total, 0) / customerInvoices.length
            : 0
        const frequency = customerInvoices.length
        const lastPurchase =
          customerInvoices.length > 0
            ? Math.min(...customerInvoices.map((i) => new Date(i.createdAt).getTime()))
            : Date.now()
        const daysSinceLastPurchase = (Date.now() - lastPurchase) / (1000 * 60 * 60 * 24)

        const recencyScore = Math.max(0, 100 - daysSinceLastPurchase)
        const frequencyScore = Math.min(100, frequency * 20)
        const monetaryScore = Math.min(100, (customer.totalPurchases / 100000) * 100)
        const predictionScore = (recencyScore + frequencyScore + monetaryScore) / 3

        return {
          name: customer.name,
          type: customer.type,
          predictionScore: Math.round(predictionScore),
          avgOrderValue: avgOrderValue.toFixed(0),
          frequency,
          totalValue: customer.totalPurchases,
          churnRisk: daysSinceLastPurchase > 90 ? "high" : daysSinceLastPurchase > 30 ? "medium" : "low",
          lifetime: (customer.totalPurchases / Math.max(1, frequency)).toFixed(0),
        }
      })
      .sort((a, b) => b.predictionScore - a.predictionScore)
  }, [customers, filteredInvoices])

  const productRecommendations = useMemo(() => {
    return products
      .map((product) => {
        const productInvoices = filteredInvoices.filter((i) => i.items.some((item) => item.productId === product.id))
        const unitsSold = productInvoices.reduce(
          (sum, i) => sum + (i.items.find((item) => item.productId === product.id)?.quantity || 0),
          0,
        )
        const totalRevenue = productInvoices.reduce(
          (sum, i) =>
            sum +
            (i.items.find((item) => item.productId === product.id)?.salePrice || 0) *
              (i.items.find((item) => item.productId === product.id)?.quantity || 1),
          0,
        )
        const totalProfit = productInvoices.reduce(
          (sum, i) => sum + (i.items.find((item) => item.productId === product.id)?.profit || 0),
          0,
        )

        const velocityScore = unitsSold * 10
        const profitScore = (totalProfit / Math.max(1, product.stock)) * 100
        const stockHealth = (product.stock / (product.minStock * 2)) * 100

        let recommendation = "Maintain"
        let priority = "normal"

        if (product.stock < product.minStock) {
          recommendation = "Urgent Restock"
          priority = "critical"
        } else if (stockHealth > 150) {
          recommendation = "Reduce Stock"
          priority = "low"
        } else if (velocityScore > 100) {
          recommendation = "Increase Stock"
          priority = "high"
        }

        return {
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock,
          unitsSold,
          totalRevenue: totalRevenue.toFixed(0),
          totalProfit: totalProfit.toFixed(0),
          stockHealth: Math.round(stockHealth),
          recommendation,
          priority,
          profitPerUnit: (totalProfit / Math.max(1, unitsSold)).toFixed(2),
        }
      })
      .sort((a, b) => (b.priority === "critical" ? 1 : -1))
  }, [products, filteredInvoices])

  const criticalAlerts = productRecommendations.filter((p) => p.priority === "critical").length
  const highValueCustomers = customerPredictions.filter((c) => c.predictionScore > 75).length
  const churnRiskCustomers = customerPredictions.filter((c) => c.churnRisk === "high").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Advanced insights, forecasts, and recommendations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex-1 min-w-48">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{filteredInvoices.length} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Est. Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalProfit.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">{profitMargin}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {criticalAlerts}
            </div>
            <p className="text-xs text-muted-foreground">Items need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>90-Day Sales Forecast</CardTitle>
              <CardDescription>Advanced prediction with confidence bands</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={advancedPredictions}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#16a34a"
                    fill="url(#colorForecast)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Stock levels and profitability</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={products.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#0ea5e9" name="Current Stock" />
                  <Bar dataKey="minStock" fill="#f59e0b" name="Min Stock" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  High-Value Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{highValueCustomers}</div>
                <p className="text-xs text-muted-foreground">Prediction score {">"} 75</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">All Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">Active relationships</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Churn Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{churnRiskCustomers}</div>
                <p className="text-xs text-muted-foreground">No purchases in 90 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Value Predictions</CardTitle>
              <CardDescription>Ranked by predictive score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {customerPredictions.map((customer, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.type === "retail" ? "Retail" : "Wholesale"} • {customer.frequency} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{customer.predictionScore}</div>
                        <p className="text-xs">Score</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lifetime Value: ₹{customer.totalValue}</span>
                      <Badge
                        variant={
                          customer.churnRisk === "high"
                            ? "destructive"
                            : customer.churnRisk === "medium"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {customer.churnRisk === "high"
                          ? "🔴 At Risk"
                          : customer.churnRisk === "medium"
                            ? "🟡 Monitor"
                            : "🟢 Stable"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Recommendations</CardTitle>
              <CardDescription>Stock health and action items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productRecommendations.map((product, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <Badge
                        variant={
                          product.priority === "critical"
                            ? "destructive"
                            : product.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {product.recommendation}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Stock</p>
                        <p className="font-medium">{product.stock}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Units Sold</p>
                        <p className="font-medium">{product.unitsSold}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Revenue</p>
                        <p className="font-medium">₹{product.totalRevenue}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Profit</p>
                        <p className="font-medium text-green-600">₹{product.totalProfit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
