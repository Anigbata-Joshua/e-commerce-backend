# E-commerce Backend API

A production-ready, secure, and robust RESTful API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. Designed to serve modern e-commerce storefronts, supporting merchants, customers, products, categories, shopping carts, reviews, ratings, and sales tracking.

## 🚀 Key Features

- **Security Audited**: Built with rate limiters, security headers, XSS sanitization, and structured request validation.
- **Robust Auth Domain Separation**: Implements double JWT domains (access & refresh tokens stored in HttpOnly cookies or Authorization headers) to guarantee merchants and customers are completely separated.
- **Input Sanitization & Validation**: Powered by **Zod** schema validations and custom recursive input sanitizers preventing SQL/NoSQL Injection, Mass Assignment vulnerabilities, and cross-site scripting (XSS).
- **Merchant Storefronts**: Merchants can register, get approved, list products, group them under custom categories, and track itemized sales.
- **Customer Features**: Interactive shopping cart (supporting product variations like colors and sizes), itemized checking out, product reviews, ratings, and likes.
- **Cloud Media Uploads**: Built-in support for streaming image uploads directly to Cloudinary.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules syntax)
- **Framework**: Express.js (v5)
- **Database**: MongoDB & Mongoose
- **File Upload**: Multer & Streamifier
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limit, XSS

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for product images)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Anigbata-Joshua/e-commerce-backend.git
   cd e-commerce-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root directory:
   ```env
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_uri

   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   FRONTEND_URI=http://localhost:5173
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173

   JWT_MERCHANT_ACCESS_SECRET=your_merchant_access_secret
   JWT_MERCHANT_REFRESH_SECRET=your_merchant_refresh_secret
   JWT_USER_ACCESS_SECRET=your_user_access_secret
   JWT_USER_REFRESH_SECRET=your_user_refresh_secret
   ```

### Running the Server
- **Development Mode** (with automatic watch/reload):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📍 API Reference

### 🔐 Authentication

All Auth routes support both HTTP-only Cookies and Bearer tokens.

#### Users (Customers)
- `POST /api/users/register` - Create customer account
- `POST /api/users/login` - Customer login
- `POST /api/users/refresh` - Refresh access token
- `POST /api/users/logout` - Logout and revoke tokens
- `PATCH /api/users/me` - Update profile *(Auth required)*
- `PATCH /api/users/me/change-password` - Change password *(Auth required)*

#### Merchants
- `POST /api/merchants/register` - Register merchant storefront
- `POST /api/merchants/login` - Merchant login
- `POST /api/merchants/refresh` - Refresh access token
- `POST /api/merchants/logout` - Logout and revoke tokens
- `GET /api/merchants/:id` - Fetch public storefront profile
- `PATCH /api/merchants/me` - Update store details *(Auth required)*
- `PATCH /api/merchants/me/change-password` - Change password *(Auth required)*

---

### 📦 Products & Categories

#### Products
- `GET /api/products` - Browse products with search & pagination (supports filter by `merchant_id`, `category_id`, or `search` string)
- `GET /api/products/:id` - Get detailed product info
- `POST /api/products` - Create new product *(Merchant only)*
- `PATCH /api/products/:id` - Edit product details *(Merchant owner only)*
- `DELETE /api/products/:id` - Remove product *(Merchant owner only)*
- `POST /api/products/:id/images` - Upload images (max 5) *(Merchant owner only)*

#### Categories
- `GET /api/categories` - Fetch all categories (supports filter by `merchant_id`)
- `POST /api/categories` - Create custom category *(Merchant only)*
- `PATCH /api/categories/:id` - Rename category *(Merchant owner only)*
- `DELETE /api/categories/:id` - Delete category *(Merchant owner only)*

---

### 🛒 Cart & Checkout (Customers Only)

- `GET /api/carts` - Retrieve user's current shopping cart
- `POST /api/carts` - Add item, or update quantity (for matching product and variations)
- `DELETE /api/carts/items/:product_id` - Remove specific item or variation (use query parameters `color_index` & `size_index` to target specific variations)
- `POST /api/carts/set-note` - Add checkout message/delivery notes
- `POST /api/carts/checkout` - Checkout (clears cart and snapshots details into a new Order)
- `DELETE /api/carts` - Clear the entire cart

---

### 💬 Social & Reviews (Customers Only)

- `GET /api/likes?product_id=:id` - Get list of likes for a product
- `POST /api/likes` - Like a product *(Auth required)*
- `DELETE /api/likes/:product_id` - Unlike a product *(Auth required)*
- `GET /api/ratings?product_id=:id` - Fetch product reviews & average rating
- `POST /api/ratings` - Submit/Upsert a rating (1-5 stars) and optional review text *(Auth required)*
- `DELETE /api/ratings/:product_id` - Delete rating *(Auth required)*
- `GET /api/reviews?product_id=:id` - Fetch discussion thread for a product
- `POST /api/reviews` - Post comments/discussions on a product *(Auth required)*
- `PATCH /api/reviews/:id` - Edit post *(Author only)*
- `DELETE /api/reviews/:id` - Delete post *(Author only)*

---

### 📊 Sales Tracking (Merchants Only)

- `GET /api/sales` - Retrieve itemized list of sales, line totals, and overall revenue generated by the merchant's store products.

---

## 🔒 Security Implementations

1. **Mass Assignment Prevention**: Input schema validation enforces safe parsing. Extra/unregistered request body keys are strictly stripped before reaching database query filters or updates.
2. **Double Token Domains**: Prevents token replaying. Merchant keys are signed with different secrets than User keys so authorization boundaries cannot be breached.
3. **Token Reuse Detection**: If a refresh token is used after already being invalidated or replaced, authorization is instantly revoked for all active sessions of that account.
4. **Data Sanitization**: Recursively strips and sanitizes potential XSS scripts from raw request bodies while safely preserving data structures like dates and MongoDB object references.
5. **Rate Limiting & Protection**: Helmet secures HTTP headers, Rate limits mitigate brute-force/DDoS requests, and CORS controls cross-origin domains.
