import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        cost_price DECIMAL(10, 2) NOT NULL,
        retail_price DECIMAL(10, 2) NOT NULL,
        wholesale_price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 10,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `

    // Create invoices table
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_type VARCHAR(20) NOT NULL,
        subtotal DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(12, 2) NOT NULL,
        total DECIMAL(12, 2) NOT NULL,
        profit DECIMAL(12, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create invoice items table
    await sql`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        cost_price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2) NOT NULL,
        profit DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create stock movements table
    await sql`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Database initialization failed:", error)
    throw error
  }
}
