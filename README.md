# 180DC UB Web Platform

![180DC UB](public/assets/logo/Logo180DC.png)

The official web platform and e-commerce portal for **180 Degrees Consulting Universitas Brawijaya (180DC UB)**. This application serves as the primary digital touchpoint for clients and students, providing an integrated store for consulting products, mentoring services, and an administrative dashboard for managing operations.

## ✨ Key Features

### User Experience
- **Modern Landing Page**: Dynamic and responsive UI showcasing services, team members, and impact metrics.
- **Product Store**: Browse and purchase consulting products including Casebooks, Decks, and Mentoring Sessions.
- **Seamless Checkout Flow**: Integrated with **Pakasir QRIS** for instant and secure payments.
- **Google Authentication**: Frictionless login and sign-up using Google OAuth.
- **Dynamic Content**: Browse articles, case studies, and knowledge assets.

### Admin Dashboard
- **Transaction Management**: Track customer orders and update payment statuses manually or via Webhooks.
- **Product & Voucher Management**: Full CRUD capabilities for store items and promotional discount codes.
- **Mentoring Schedules**: Manage available slots and track bookings for mentoring products.
- **Financial Payouts**: Automated calculation and PDF generation for mentoring payouts (80% revenue split).
- **Content Management**: Upload and manage articles and case studies directly from the dashboard.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Edge Functions, OAuth)
- **Payment Gateway**: [Pakasir](https://pakasir.com/) (QRIS Integration & Webhooks)
- **Icons & UI Elements**: [Lucide React](https://lucide.dev/), Framer Motion, React Hot Toast
- **PDF Generation**: jsPDF & jsPDF-AutoTable

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
- Node.js (v20+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 180dc_ub_web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure the necessary variables (see Environment Variables section below).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Gateway (Pakasir)
PAKASIR_API_KEY=your_pakasir_api_key
PAKASIR_SLUG=your_pakasir_slug

# Base URL (for webhooks and redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📁 Project Structure

- `/app`: Next.js App Router pages and API routes (`/api`, `/admin`, `/product`, etc.)
- `/components`: Reusable React components (`/layout`, `/ui`, etc.)
- `/lib`: Utility functions and configuration files (Supabase client setups)
- `/public`: Static assets like images, logos, and fonts

## 🚢 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/). 

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Configure the **Environment Variables** in the Vercel dashboard.
4. Deploy!

*(Note: Ensure that your Supabase Auth Redirect URLs and Pakasir Webhook URLs are updated to match your production domain after deployment).*

---
*Built with ❤️ by the 180DC UB Development Team.*
