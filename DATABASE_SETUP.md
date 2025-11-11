# RetailOS Database & Local Setup Guide

## Overview
RetailOS is a production-grade retail and wholesale management system built with Next.js and uses in-memory data storage for quick prototyping.

## Current Setup (Development)

### Technology Stack
- **Frontend**: Next.js 16 (React 19)
- **Backend**: Next.js API Routes
- **Data Storage**: In-Memory Store (TypeScript Map-based)
- **Authentication**: Cookie-based sessions
- **Styling**: Tailwind CSS v4 with custom design tokens

### Running Locally

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd retail-os
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

#### Creating an Account
- Go to http://localhost:3000/signup
- Fill in email, password, and business name
- You'll be logged in automatically
- Start adding products and creating invoices

## Production Setup (Database Migration)

### Recommended Database Solutions

#### Option 1: PostgreSQL (Recommended)
Best for structured data with strong consistency requirements.

**Setup Steps:**

1. **Install PostgreSQL locally or use Supabase**
   - **Local**: [postgresql.org](https://www.postgresql.org/download/)
   - **Cloud**: [supabase.com](https://supabase.com) (free tier available)

2. **Update `lib/db.ts` with connection**
   \`\`\`typescript
   import { Pool } from 'pg'
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   })
   
   export const db = pool
   \`\`\`

3. **Create schema** (SQL migrations in `scripts/db/`)
   \`\`\`sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     business_name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )
   
   CREATE TABLE products (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id),
     name VARCHAR(255) NOT NULL,
     cost_price DECIMAL(10, 2) NOT NULL,
     sale_price DECIMAL(10, 2) NOT NULL,
     stock INTEGER DEFAULT 0,
     category VARCHAR(100),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )
   
   CREATE TABLE invoices (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id),
     customer_name VARCHAR(255) NOT NULL,
     total_amount DECIMAL(10, 2) NOT NULL,
     status VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )
   
   CREATE TABLE invoice_items (
     id SERIAL PRIMARY KEY,
     invoice_id INTEGER REFERENCES invoices(id),
     product_id INTEGER REFERENCES products(id),
     quantity INTEGER NOT NULL,
     cost_price DECIMAL(10, 2) NOT NULL,
     sale_price DECIMAL(10, 2) NOT NULL,
     profit DECIMAL(10, 2)
   )
   \`\`\`

#### Option 2: MongoDB
Good for flexible schemas and rapid prototyping.

**Setup Steps:**

1. **Use MongoDB Atlas** (free tier)
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create account and cluster
   - Get connection string

2. **Install MongoDB driver**
   \`\`\`bash
   npm install mongodb
   \`\`\`

3. **Update `lib/db.ts`**
   \`\`\`typescript
   import { MongoClient } from 'mongodb'
   
   const client = new MongoClient(process.env.MONGODB_URI)
   export const db = client.db('retailos')
   \`\`\`

#### Option 3: Firebase/Firestore
Good for real-time features and automatic scaling.

**Setup Steps:**

1. **Create Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Install Firebase SDK**
   \`\`\`bash
   npm install firebase-admin
   \`\`\`

3. **Initialize in `lib/db.ts`**
   \`\`\`typescript
   import admin from 'firebase-admin'
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   })
   
   export const db = admin.firestore()
   \`\`\`

### Environment Variables

Create `.env.local` in project root:

\`\`\`
# Database
DATABASE_URL=your_database_connection_string

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# API
API_BASE_URL=http://localhost:3000/api
\`\`\`

### Data Migration Strategy

1. **Export current data** from in-memory store to JSON
2. **Transform data** to match database schema
3. **Import** into production database
4. **Test thoroughly** before switching

## Current Data Store Architecture

The system uses an in-memory TypeScript store for quick setup:

\`\`\`typescript
interface Product {
  id: string
  userId: string
  name: string
  costPrice: number
  salePrice: number
  stock: number
  category: string
  createdAt: Date
}

interface Invoice {
  id: string
  userId: string
  customerName: string
  items: InvoiceItem[]
  totalAmount: number
  status: 'draft' | 'paid' | 'pending'
  createdAt: Date
}

interface User {
  id: string
  email: string
  businessName: string
  password: string
  createdAt: Date
}
\`\`\`

## API Endpoints (Update for Database)

Convert all existing endpoints from in-memory to database queries:

**Example - Create Product:**

**Before (In-Memory):**
\`\`\`typescript
export const createProduct = (userId: string, data: Product) => {
  const id = crypto.randomUUID()
  products.set(id, { ...data, id, userId })
  return { ...data, id, userId }
}
\`\`\`

**After (PostgreSQL):**
\`\`\`typescript
export const createProduct = async (userId: string, data: any) => {
  const result = await db.query(
    'INSERT INTO products (user_id, name, cost_price, sale_price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, data.name, data.costPrice, data.salePrice, data.stock]
  )
  return result.rows[0]
}
\`\`\`

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Add environment variables
   - Deploy

### Deploy to Other Platforms

- **Railway**: railway.app (simple PostgreSQL integration)
- **Render**: render.com (full stack deployment)
- **Heroku**: heroku.com (easy deployment)

## Testing the System

\`\`\`bash
# Run development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Support & Next Steps

1. **Development**: The current in-memory system works perfectly for testing
2. **Before Production**: Integrate a database using the guides above
3. **Scaling**: Monitor performance and add caching as needed
4. **Backup**: Set up regular database backups

For questions or deployment help, refer to Next.js documentation or contact support.
