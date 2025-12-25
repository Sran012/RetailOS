// Load environment variables from .env.local FIRST (before any imports)
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") })

// Also try .env as fallback
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), ".env") })
}

// Now dynamically import db AFTER env vars are loaded
// This prevents db.ts from executing before env vars are available
async function init() {
  const { initializeDatabase } = await import("../lib/db")

  try {
    await initializeDatabase()
    console.log("✅ Database initialized successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  }
}

init()

