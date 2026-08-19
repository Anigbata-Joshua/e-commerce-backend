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

Unless noted otherwise, request bodies are JSON (`Content-Type: application/json`). Fields marked **required** must be present; everything else is optional. `PATCH`/update schemas accept any subset of their fields — only send what you want to change.

### 🔐 Authentication

All Auth routes support both HTTP-only Cookies and Bearer tokens.

#### Users (Customers)

**`POST /api/users/register`** — Create customer account
| Field | Type | Required | Notes |
|---|---|---|---|
| `full_name` | string | ✅ | |
| `email` | string | ✅ | valid email format |
| `phone` | string | ✅ | |
| `password` | string | ✅ | min 6 chars; must include an uppercase letter, a number, and a special character |

**`POST /api/users/login`** — Customer login
| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**`POST /api/users/refresh`** — Refresh access token
No body required — reads the refresh token from the `userRefreshToken` cookie, or `refreshToken` in the body as a fallback.

**`POST /api/users/logout`** — Logout and revoke tokens
Same as above — no body required unless not using cookies.

**`PATCH /api/users/me`** — Update profile *(Auth required)*
| Field | Type | Required |
|---|---|---|
| `full_name` | string | ❌ |
| `email` | string | ❌ |
| `phone` | string | ❌ |

**`PATCH /api/users/me/change-password`** — Change password *(Auth required)*
| Field | Type | Required |
|---|---|---|
| `old_password` | string | ✅ |
| `new_password` | string | ✅ | same complexity rule as registration |

#### Merchants

**`POST /api/merchants/register`** — Register merchant storefront
| Field | Type | Required | Notes |
|---|---|---|---|
| `full_name` | string | ✅ | |
| `email` | string | ✅ | valid email format |
| `phone` | string | ✅ | |
| `phones` | string[] | ❌ | additional contact numbers |
| `password` | string | ✅ | same complexity rule as User |
| `store_name` | string | ✅ | |
| `descp` | string | ❌ | store description |
| `icon` | string | ❌ | image URL |
| `banner` | string | ❌ | image URL |

New merchants start with `status: "pending"` and must be approved before they can create products.

**`POST /api/merchants/login`** — Merchant login
| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**`POST /api/merchants/refresh`** — Refresh access token
No body required — reads the refresh token from the `merchantRefreshToken` cookie, or `refreshToken` in the body as a fallback.

**`POST /api/merchants/logout`** — Logout and revoke tokens
No body required unless not using cookies.

**`GET /api/merchants/:id`** — Fetch public storefront profile
No body — public route.

**`PATCH /api/merchants/me`** — Update store details *(Auth required)*
| Field | Type | Required |
|---|---|---|
| `full_name` | string | ❌ |
| `email` | string | ❌ |
| `phone` | string | ❌ |
| `phones` | string[] | ❌ |
| `store_name` | string | ❌ |
| `descp` | string | ❌ |
| `icon` | string | ❌ |
| `banner` | string | ❌ |
| `state` | string | ❌ |
| `district` | string | ❌ |
| `social_media` | object | ❌ | `{ x, face_book, instagram }`, all optional strings |

**`PATCH /api/merchants/me/change-password`** — Change password *(Auth required)*
| Field | Type | Required |
|---|---|---|
| `old_password` | string | ✅ |
| `new_password` | string | ✅ |

---

### 📦 Products & Categories

#### Products

**`GET /api/products`** — Browse products with search & pagination
Query params, all optional: `merchant_id`, `category_id`, `search`, `page` (default 1), `limit` (default 20). No body.

**`GET /api/products/:id`** — Get detailed product info
No body — public route.

**`POST /api/products`** — Create new product *(Merchant only, must be approved)*
| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | |
| `category_id` | string | ✅ | must be a category owned by this merchant |
| `price` | number | ✅ | ≥ 0 |
| `descp` | string | ❌ | |
| `brand` | string | ❌ | |
| `quantity` | number | ❌ | integer ≥ 0, default 0 |
| `images` | string[] | ❌ | image URLs (see also the dedicated image-upload endpoint below) |
| `currency` | string | ❌ | |
| `min_qty` | number | ❌ | positive integer |
| `max_qty` | number | ❌ | positive integer |
| `discount` | number | ❌ | ≥ 0 |
| `discount_expiration` | string | ❌ | ISO datetime |
| `has_refund_policy` | boolean | ❌ | |
| `has_discount` | boolean | ❌ | |
| `has_shipment` | boolean | ❌ | |
| `has_variation` | boolean | ❌ | |
| `shipping_locations` | string[] | ❌ | |
| `attrib` | array | ❌ | `[{ type, content: [{ name, value }] }]` |
| `variations` | array | ❌ | `[{ type, text, content: [{ display: [{type, value}], text }] }]` |

**`PATCH /api/products/:id`** — Edit product details *(Merchant owner only)*
Same fields as create, all optional — send only what's changing. If `category_id` is included, it's re-verified as belonging to this merchant.

**`DELETE /api/products/:id`** — Remove product *(Merchant owner only)*
No body.

**`POST /api/products/:id/images`** — Upload images (max 5) *(Merchant owner only)*
Not JSON — send as `multipart/form-data`. Field name: `images`, type File. Up to 5 files, 5MB each, image types only. Uploaded files are streamed to Cloudinary and their resulting URLs are appended to the product's existing `images` array.

#### Categories

**`GET /api/categories`** — Fetch all categories
Query param, optional: `merchant_id`. No body.

**`POST /api/categories`** — Create custom category *(Merchant only)*
| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `image` | string | ❌ | image URL |

A merchant cannot have two categories with the same name.

**`PATCH /api/categories/:id`** — Rename category *(Merchant owner only)*
| Field | Type | Required |
|---|---|---|
| `name` | string | ❌ |
| `image` | string | ❌ |

**`DELETE /api/categories/:id`** — Delete category *(Merchant owner only)*
No body.

---

### 🛒 Cart & Checkout (Customers Only)

**`GET /api/carts`** — Retrieve user's current shopping cart
No body.

**`POST /api/carts`** — Add item, or update quantity for a matching product + variation
| Field | Type | Required | Notes |
|---|---|---|---|
| `product_id` | string | ✅ | |
| `quantity` | number | ✅ | positive integer |
| `has_variation` | boolean | ❌ | |
| `variation` | object | ❌ | `{ color_index, size_index }`, both optional numbers |

If an item with the same `product_id` and `variation` is already in the cart, its quantity is overwritten rather than a duplicate line being added.

**`POST /api/carts/set-note`** — Add checkout message/delivery notes
| Field | Type | Required |
|---|---|---|
| `note` | string | ❌ |

**`POST /api/carts/checkout`** — Checkout
No body. Snapshots the cart's current items into a new Order (freezing price/title at time of purchase), then clears the cart.

**`DELETE /api/carts`** — Clear the entire cart
No body.

---

### 💬 Social & Reviews (Customers Only)

**`GET /api/likes?product_id=:id`** — Get list of likes for a product
No body — public route.

**`POST /api/likes`** — Like a product *(Auth required)*
| Field | Type | Required |
|---|---|---|
| `product_id` | string | ✅ |

Returns `409` if this user already liked the product.

**`DELETE /api/likes/:product_id`** — Unlike a product *(Auth required)*
No body.

**`GET /api/ratings?product_id=:id`** — Fetch product ratings & average
No body — public route.

**`POST /api/ratings`** — Submit/Upsert a rating *(Auth required)*
| Field | Type | Required | Notes |
|---|---|---|---|
| `product_id` | string | ✅ | |
| `value` | number | ✅ | integer, 1–5 |
| `text` | string | ❌ | optional review text |

One rating per user per product — resubmitting updates the existing rating rather than creating a second one.

**`DELETE /api/ratings/:product_id`** — Delete rating *(Auth required)*
No body.

**`GET /api/reviews?product_id=:id`** — Fetch reviews for a product
No body — public route.

**`POST /api/reviews`** — Post a review *(Auth required)*
| Field | Type | Required |
|---|---|---|
| `product_id` | string | ✅ |
| `text` | string | ✅ |

**`PATCH /api/reviews/:id`** — Edit review *(Author only)*
| Field | Type | Required |
|---|---|---|
| `text` | string | ✅ |

**`DELETE /api/reviews/:id`** — Delete review *(Author only)*
No body.

---

### 📊 Sales Tracking (Merchants Only)

**`GET /api/sales`** — Retrieve itemized list of sales, line totals, and overall revenue *(Auth required)*
No body — returns every line item this merchant has sold, pulled from any order containing at least one of their products, plus a `total_revenue` sum.

---

## 🔒 Security Implementations

1. **Mass Assignment Prevention**: Input schema validation enforces safe parsing. Extra/unregistered request body keys are strictly stripped before reaching database query filters or updates.
2. **Double Token Domains**: Prevents token replaying. Merchant keys are signed with different secrets than User keys so authorization boundaries cannot be breached.
3. **Token Reuse Detection**: If a refresh token is used after already being invalidated or replaced, authorization is instantly revoked for that account's session.
4. **Data Sanitization**: Recursively strips and sanitizes potential XSS scripts from raw request bodies while safely preserving data structures like dates and MongoDB object references.
5. **Rate Limiting & Protection**: Helmet secures HTTP headers, rate limits mitigate brute-force/DDoS requests, and CORS controls cross-origin domains.
6. **Merchant Approval Gate**: New merchants default to `status: "pending"` and cannot create products until manually approved.