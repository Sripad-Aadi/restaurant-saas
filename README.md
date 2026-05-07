# Restaurant SaaS Platform

A high-performance, multi-tenant SaaS platform designed for restaurants to manage their digital menu, live orders, tables, and branding.

## 🚀 Features

### SuperAdmin (Platform Management)
- **Store Onboarding**: Create and manage tenant restaurants.
- **Platform Analytics**: Track revenue and order volume across the entire platform.
- **Security Logs**: Monitor administrative actions and system security events.
- **Global Maintenance**: Toggle maintenance mode for the entire platform or specific stores.
- **Subscription Management**: Track and manage restaurant subscription plans.

### Admin (Restaurant Owner)
- **Live Order Management**: Real-time order tracking and status updates via WebSockets.
- **Menu Management**: Drag-and-drop categories and products with image upload support.
- **Table Management**: Generate QR codes for physical tables to enable contactless ordering.
- **Store Branding**: Custom logo and cover photo management.
- **Analytics Dashboard**: Daily revenue, order counts, and performance metrics.

### Customer (Digital Menu)
- **Slug-based Branding**: Access menus via `/menu/restaurant-slug`.
- **Contactless Ordering**: Scan QR codes to automatically link orders to a table.
- **Real-time Tracking**: Monitor order status (Pending → Preparing → Ready) in real-time.
- **Guest Checkout**: Fast, friction-less ordering experience.

## 🛠️ Technology Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Vite.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Real-time**: Socket.io.
- **Caching/Storage**: Redis (Menu caching and rate limiting).
- **File Handling**: Multer (Local disk storage).

## 📂 Project Structure

```text
├── apps
│   ├── api           # Express server & Business logic
│   ├── admin-ui      # React app for Store & Platform Admins
│   ├── customer-ui   # React app for Customers (Menu & Tracking)
│   └── socket        # Dedicated Socket.io server
├── packages
│   └── shared        # Shared constants and validation schemas
├── infra             # Nginx and deployment configurations
└── uploads           # Static directory for uploaded images
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Redis

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `apps/api/.env` (use `.env.example` as a template).
4. Start the development servers:
   ```bash
   npm run dev
   ```

## 🔮 Future Scope
- **Payment Integration**: Razorpay/Stripe for automated checkouts.
- **Notifications**: Email and SMS alerts for order updates.
- **AI Insights**: Predictive analytics for inventory and sales.
- **Mobile Apps**: Dedicated apps for kitchen staff and delivery partners.

