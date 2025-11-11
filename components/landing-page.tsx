"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import HeroSection from "./hero-section"
import {
  Package,
  TrendingUp,
  BarChart3,
  Zap,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Star,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [activeTab, setActiveTab] = useState("monthly")
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Real-time stock tracking with AI-predicted stockouts and automated reorder alerts",
    },
    {
      icon: DollarSign,
      title: "Wholesale & Retail Pricing",
      description: "Separate pricing tiers with automatic calculation based on customer type",
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Predictions",
      description: "Predict stock shortages, optimize pricing, and forecast sales with 95% accuracy",
    },
    {
      icon: ShoppingCart,
      title: "Invoice Generation",
      description: "Professional PDF invoices with cost tracking and profit calculations",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Advanced dashboards with 90-day forecasts and customer insights",
    },
    {
      icon: Zap,
      title: "Multi-location Support",
      description: "Manage multiple stores with centralized reporting and inventory sync",
    },
  ]

  const stats = [
    { number: "10000", label: "Products Managed" },
    { number: "₹50Cr", label: "Sales Tracked" },
    { number: "99.9", label: "% Uptime" },
    { number: "500", label: "Happy Businesses" },
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      business: "Electronics Retail Store",
      quote:
        "RetailOS transformed how we manage inventory. We reduced stockouts by 60% and increased sales visibility dramatically.",
    },
    {
      name: "Priya Sharma",
      business: "Fashion Wholesale",
      quote:
        "The AI predictions are incredibly accurate. We now forecast demand weeks in advance and optimize our purchasing strategy.",
    },
    {
      name: "Amit Patel",
      business: "Multi-brand Distributor",
      quote:
        "Managing wholesale and retail together was a nightmare. Now it's seamless with automatic pricing and invoicing.",
    },
  ]

  const pricingTiers = [
    {
      name: "Free",
      price: "₹0",
      period: "/forever",
      description: "Perfect for getting started",
      features: ["Up to 100 products", "Basic inventory tracking", "Manual sales entry", "Email support"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "₹999",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Unlimited products",
        "AI predictions",
        "Wholesale & retail pricing",
        "Advanced analytics",
        "PDF invoices",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large operations",
      features: [
        "Everything in Professional",
        "Multi-location management",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ]

  const faqs = [
    {
      question: "Do I need technical knowledge to use RetailOS?",
      answer:
        "No! RetailOS is designed for business owners with no technical background. The interface is intuitive and we provide comprehensive support.",
    },
    {
      question: "Can I import my existing data?",
      answer:
        "Yes, we support data import from Excel, CSV, and other retail management systems. Our team can assist with the migration.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption, regular backups, and comply with data protection regulations. Your data is your priority.",
    },
    {
      question: "Can I use RetailOS offline?",
      answer:
        "You can view cached data offline, but real-time sync requires internet. We're working on enhanced offline capabilities.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, UPI, and bank transfers. Annual subscriptions get a 20% discount.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No setup fees! You can start for free and upgrade anytime. Enterprise plans may include onboarding assistance.",
    },
  ]

  const [counters, setCounters] = useState(stats.map(() => 0))

  useEffect(() => {
    let interval: NodeJS.Timeout
    setInterval(() => {
      setCounters((prev) =>
        prev.map((count, i) => {
          const targetStr = stats[i].number.replace(/[^0-9]/g, "")
          const target = Number.parseInt(targetStr)
          const increment = Math.ceil(target / 50)
          return count < target ? count + increment : target
        }),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RetailOS
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition">
              FAQ
            </a>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border p-4 flex flex-col gap-3">
            <a href="#features" className="text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Logo Banner */}
      <section className="border-y border-border py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-muted-foreground mb-12">Trusted by 1000+ retailers across India</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-center">
            {["Flipkart", "Amazon", "Meesho", "Shopify", "WooCommerce", "Custom"].map((brand) => (
              <div key={brand} className="text-center text-muted-foreground/60 font-semibold text-sm">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features Built for Growth</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to scale your retail business intelligently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card
                key={i}
                className="border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] cursor-pointer group"
              >
                <CardContent className="pt-8">
                  <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Product Preview */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">See It In Action</h2>
          <p className="text-lg text-muted-foreground">Powerful dashboard designed for real business needs</p>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden relative">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-11-11%20020946-5rCHCrBFmTngx5yBbNfoCXfuA6bFcN.png"
            alt="RetailOS Dashboard - Sales & Invoicing"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Get up and running in minutes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              number: "1",
              title: "Add Your Products",
              description: "Input your product catalog with cost prices and retail/wholesale rates",
              icon: Package,
            },
            {
              number: "2",
              title: "Track Your Sales",
              description: "Create invoices and track sales in real-time. Stock updates automatically.",
              icon: ShoppingCart,
            },
            {
              number: "3",
              title: "Get Insights",
              description: "View analytics, forecasts, and profit reports. Make data-driven decisions.",
              icon: TrendingUp,
            },
          ].map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mb-6 relative z-10">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[58%] w-[84%] h-0.5 bg-border" />}
              </div>
            )
          })}
        </div>
      </section>

      {/* AI Features */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Intelligence That <span className="text-primary">Grows Your Business</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our AI engine learns from your business patterns and helps you make smarter decisions
            </p>

            <div className="space-y-4">
              {[
                "Predict stock shortages before they happen",
                "Optimize pricing based on real demand",
                "Forecast sales with 95% accuracy",
              ].map((feature, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-11-11%20021157-HvJjEMnd6RqX9JhpCu0jrHYpisurUC.png"
              alt="7-Day Sales Trend - Retail vs Wholesale"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Business Owners</h2>
          <p className="text-lg text-muted-foreground">See what our customers have to say</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="border border-border hover:border-primary/50 transition">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{counters[i]}+</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8">Choose the plan that fits your business</p>

          {/* Pricing Toggle */}
          <div className="inline-flex gap-2 bg-card rounded-lg p-1">
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-6 py-2 rounded transition ${
                activeTab === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab("yearly")}
              className={`px-6 py-2 rounded transition ${
                activeTab === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, i) => (
            <Card
              key={i}
              className={`border transition-all ${
                tier.highlighted
                  ? "border-primary ring-2 ring-primary/20 shadow-lg md:scale-105"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <CardContent className="pt-8 space-y-6">
                {tier.highlighted && (
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold w-fit">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{tier.description}</p>
                </div>

                <div>
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">{tier.period}</span>
                </div>

                <Link href="/signup" className="w-full block">
                  <Button className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                    {tier.cta}
                  </Button>
                </Link>

                <div className="space-y-3 pt-4 border-t border-border">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex gap-2">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about RetailOS</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? -1 : i)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-card/50 transition"
              >
                <span className="font-semibold text-left">{faq.question}</span>
                <ArrowRight
                  className={`w-5 h-5 text-primary transition-transform ${expandedFaq === i ? "rotate-90" : ""}`}
                />
              </button>

              {expandedFaq === i && (
                <div className="px-6 py-4 bg-card/30 border-t border-border">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of retailers who are already growing smarter with RetailOS
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
            <Link href="/signup" className="sm:w-auto w-full">
              <Button className="w-full gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 RetailOS. All rights reserved.</p>
          </div>
        </div>

        <div className="w-full bg-primary/5 border-t border-primary/20 py-6 text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RetailOS
          </p>
        </div>
      </footer>
    </div>
  )
}
