"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, FileText, Package, Box, BarChart3, Receipt, Warehouse, Store, ArrowRight } from "lucide-react"

export default function HeroSection() {
  // Define the 8 shop-related icons
  const heroIcons = [
    { Icon: ShoppingCart, angle: 0 }, // right
    { Icon: FileText, angle: 45 }, // top-right
    { Icon: Package, angle: 90 }, // top
    { Icon: Box, angle: 135 }, // top-left
    { Icon: BarChart3, angle: 180 }, // left
    { Icon: Receipt, angle: 225 }, // bottom-left
    { Icon: Warehouse, angle: 270 }, // bottom
    { Icon: Store, angle: 315 }, // bottom-right
  ]

  // Calculate final positions for circular distribution (~450px distance)
  const calculatePosition = (angle: number, distance = 450) => {
    const radians = (angle * Math.PI) / 180
    return {
      x: Math.cos(radians) * distance,
      y: Math.sin(radians) * distance,
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Fixed Background Icons - Absolutely Positioned */}
      <div className="absolute inset-0 pointer-events-none">
        {heroIcons.map(({ Icon, angle }, i) => {
          const finalPos = calculatePosition(angle)
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
              }}
              initial={{
                x: "-50%",
                y: "-50%",
                opacity: 1,
              }}
              animate={{
                x: `calc(-50% + ${finalPos.x}px)`,
                y: `calc(-50% + ${finalPos.y}px)`,
                opacity: 0.18,
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.5,
              }}
            >
              <Icon className="w-20 h-20 text-primary" />
            </motion.div>
          )
        })}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
          Manage Your{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Retail Empire</span>{" "}
          with Intelligence
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
          Streamline your business with intelligent inventory management, advanced analytics, and seamless customer
          management. Stop managing spreadsheets. Start growing your business.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Login to Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">No credit card required • 14-day free trial • Cancel anytime</p>
      </div>
    </section>
  )
}
