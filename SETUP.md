# RetailOS - Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database

## Local Development Setup

### 1. Get Neon PostgreSQL URL

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### 2. Setup Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
DATABASE_URL=postgresql://user:password@host/database
SALT=your-secret-salt-key
NODE_ENV=development
\`\`\`

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Initialize Database

\`\`\`bash
npm run init-db
\`\`\`

This will create all tables in your PostgreSQL database.

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `password_hash` - Hashed password
- `name` - User name
- `business_name` - Business name
- `created_at` - Account creation timestamp

### Products Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Product name
- `sku` - Stock keeping unit (unique per user)
- `cost_price` - Cost price in ₹
- `retail_price` - Retail selling price
- `wholesale_price` - Wholesale selling price
- `stock` - Current stock quantity
- `min_stock` - Minimum stock threshold
- `category` - Product category

### Invoices Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `business_name` - Business name on invoice
- `customer_name` - Customer name
- `customer_type` - "retail" or "wholesale"
- `subtotal` - Subtotal in ₹
- `tax_amount` - Tax amount
- `total` - Total amount
- `profit` - Profit amount
- `status` - "paid", "pending", or "partial"
- `due_date` - Payment due date

### Invoice Items Table
- `id` - Primary key
- `invoice_id` - Foreign key to invoices
- `product_id` - Foreign key to products
- `product_name` - Product name snapshot
- `quantity` - Quantity sold
- `cost_price` - Cost at time of sale
- `sale_price` - Sale price at time of sale
- `profit` - Profit on this item

### Stock Movements Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `product_id` - Foreign key to products
- `product_name` - Product name
- `type` - "in" or "out"
- `quantity` - Quantity moved
- `reason` - Reason for movement

## API Endpoints

All endpoints require authentication via `auth-token` cookie.

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice status

### Stock Movements
- `GET /api/stock-movements` - Get all stock movements
- `POST /api/stock-movements` - Record stock movement

### Analytics
- `GET /api/analytics` - Get analytics data

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel:
   - `DATABASE_URL` - Your Neon database URL
   - `SALT` - Secret salt key
4. Deploy!

### Other Platforms

For Railway, Render, Heroku, follow the same pattern:
1. Set `DATABASE_URL` environment variable
2. Run `npm run init-db` post-deployment
3. Start the app

## Troubleshooting

**"DATABASE_URL not set"**
- Check `.env.local` has DATABASE_URL
- Verify Neon connection string is correct

**"Table already exists"**
- This is normal on subsequent runs
- Database initialization is idempotent

**Connection refused**
- Verify DATABASE_URL is correct
- Check Neon project is active
- Ensure your IP is whitelisted (Neon auto-allows most connections)

## Support

For issues, check:
- DATABASE_URL format
- Node.js version (must be 18+)
- Neon connection status
