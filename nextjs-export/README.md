# Marketa — Next.js (App Router) export

A reference port of the TanStack Start project to **Next.js 14 App Router**.
This folder is **not** built or served by Lovable — it's a downloadable
scaffold you can lift into a fresh Next.js repo.

## Run locally

```bash
cd nextjs-export
npm install          # or pnpm install / bun install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Point `NEXT_PUBLIC_API_BASE_URL` at your Express
+ MongoDB backend (default `http://localhost:5000/api`).

## Structure

```
nextjs-export/
├── app/                          # App Router pages
│   ├── layout.jsx                # root layout (was src/routes/__root.jsx)
│   ├── providers.jsx             # React Query + Auth + Cart providers
│   ├── page.jsx                  # /
│   ├── not-found.jsx             # 404
│   ├── error.jsx                 # error boundary
│   ├── products/
│   │   ├── page.jsx              # /products
│   │   └── [id]/page.jsx         # /products/:id
│   ├── cart/page.jsx
│   ├── checkout/page.jsx
│   ├── login/page.jsx
│   ├── register/page.jsx
│   └── dashboard/{admin,buyer,seller}/page.jsx
├── src/
│   ├── components/               # site + shadcn/ui components (unchanged)
│   ├── lib/
│   │   ├── api.js                # axios client (NEXT_PUBLIC_API_BASE_URL)
│   │   ├── auth-context.jsx
│   │   ├── cart-context.jsx
│   │   ├── format.js
│   │   ├── utils.js
│   │   └── router-compat.jsx     # Link/useNavigate shim → next/link, next/navigation
│   ├── hooks/
│   └── assets/                   # images (see notes below)
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.mjs
├── jsconfig.json                 # @/* → ./src/*
├── package.json
└── .env.example
```

## Route mapping

| Original (TanStack)                | Next.js App Router                    |
|------------------------------------|---------------------------------------|
| `src/routes/__root.jsx`            | `app/layout.jsx` + `app/providers.jsx`|
| `src/routes/index.jsx`             | `app/page.jsx`                        |
| `src/routes/products.jsx`          | `app/products/page.jsx`               |
| `src/routes/products.$id.jsx`      | `app/products/[id]/page.jsx`          |
| `src/routes/cart.jsx`              | `app/cart/page.jsx`                   |
| `src/routes/checkout.jsx`          | `app/checkout/page.jsx`               |
| `src/routes/login.jsx`             | `app/login/page.jsx`                  |
| `src/routes/register.jsx`          | `app/register/page.jsx`               |
| `src/routes/dashboard.admin.jsx`   | `app/dashboard/admin/page.jsx`        |
| `src/routes/dashboard.buyer.jsx`   | `app/dashboard/buyer/page.jsx`        |
| `src/routes/dashboard.seller.jsx`  | `app/dashboard/seller/page.jsx`       |

## What the compat shim does

`src/lib/router-compat.jsx` translates TanStack Router primitives to Next.js
equivalents so shared components (Navbar, Footer, ProductCard, CartDrawer)
work unmodified:

- `<Link to="/products/$id" params={{ id }}>` → `next/link` with a resolved
  `href`.
- `useNavigate()` → wraps `useRouter().push()` / `.replace()`.
- `useRouter()` → Next router with a `.invalidate()` that calls `refresh()`.
- `createFileRoute`, `HeadContent`, `Scripts`, `Outlet` are stubbed (they
  don't apply in Next.js).

## Known follow-ups (mechanical, not blocking)

Because this is a scaffold ported by machine, a few spots benefit from a
manual polish pass:

1. **Static image imports.** Some pages use `import heroImage from
   "@/assets/hero.jpg"` and then `<img src={heroImage} />`. In Next.js
   static imports return an object; change to
   `<img src={heroImage.src} />` or switch to `<Image>` from `next/image`.
2. **Per-page metadata.** Each `app/**/page.jsx` currently inherits the
   root `metadata`. To restore per-route titles/descriptions, export a
   `metadata = {...}` object from each page. This can't live inside a
   `"use client"` file — split the page into a small server component that
   defines `metadata` and renders a `"use client"` inner component.
3. **Product page SEO from data.** In App Router, use
   `export async function generateMetadata({ params })` to fetch and
   surface product title/description/og:image server-side.
4. **Search-param typing.** The products page uses a Zod schema on
   TanStack; the shim's `useSearch()` returns raw strings with a couple of
   numeric coercions. Re-add Zod parsing if you want the original type
   safety.
5. **Auth guards.** Dashboards check `useAuth()` client-side, same as the
   original. Wrap them with a Next middleware or a server-component check
   if you want SSR redirects.

## Backend

Nothing about the backend changes. Both the TanStack app and this Next.js
export talk to the same Express + MongoDB API via `axios`, and read the JWT
from `localStorage` under the `marketa_token` key.
