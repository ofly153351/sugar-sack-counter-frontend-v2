# Sugar Sack Counter Frontend v2

Frontend project for the Sugar Sack Counter system, built with Next.js (App Router), TypeScript, and multi-language support (Thai/English).

## Tech Stack

- `Next.js 16` (App Router)
- `React 19` + `TypeScript`
- `Tailwind CSS 4`
- `next-intl` / `i18next` for i18n
- `@tanstack/react-query` for server-state/data fetching
- `axios` for API requests
- `zustand` for client-side state

## Project File Structure

```text
.
├── src/
│   ├── app/                         # Next.js App Router routes and layouts
│   │   ├── [locale]/                # Locale-based routes (th, en)
│   │   │   ├── (auth)/              # Login/register pages
│   │   │   ├── (user)/              # User pages (home, count)
│   │   │   └── admin/               # Admin pages and dashboard
│   │   ├── layout.tsx               # Root app layout
│   │   ├── client-layout.tsx        # Client wrapper for browser-only logic
│   │   ├── globals.css              # Global styles
│   │   └── page.tsx                 # Root page
│   │
│   ├── components/                  # UI components grouped by domain
│   │   ├── users/                   # User management tables/forms/modals
│   │   ├── vehicles/                # Vehicle management tables/forms/modals
│   │   ├── products/                # Product management tables/forms/modals
│   │   ├── count/                   # Counting flow UI (bag/box/upload/tabs)
│   │   ├── image-upload/            # Image upload modal + AI detection result
│   │   ├── sidebar/                 # Admin sidebar
│   │   ├── Nav/                     # Navigation component
│   │   ├── ui/                      # Base UI components (chart/card)
│   │   └── ...                      # Other reusable components
│   │
│   ├── hooks/                       # Custom hooks per module
│   │   ├── useUsers.ts
│   │   ├── useVehicles.ts
│   │   ├── useProducts.ts
│   │   ├── useDashboardSummary.ts
│   │   └── useCount.ts
│   │
│   ├── utils/                       # Utilities, API layer, and shared types
│   │   ├── api-client.ts            # Shared Axios client
│   │   ├── config.ts                # Centralized env/config reader
│   │   ├── types.ts                 # Shared types
│   │   ├── login/                   # Login auth/api/form logic
│   │   ├── register/                # Register api/validation logic
│   │   ├── admin/                   # Admin API helpers (users/products/vehicles/dashboard)
│   │   ├── count/                   # Count module API helpers
│   │   ├── ai/                      # AI integration API helpers
│   │   └── diagnostics/             # System diagnostics (for example MinIO)
│   │
│   ├── i18n/                        # Localization setup and dictionaries
│   │   ├── en/common.json           # English translations
│   │   ├── th/common.json           # Thai translations
│   │   ├── settings.ts              # Locale defaults
│   │   ├── request.ts               # i18n request config
│   │   └── dictionaries.ts          # Dictionary loading helpers
│   │
│   ├── providers/                   # Global providers
│   │   └── ReactQueryProvider.tsx   # React Query provider
│   │
│   ├── store/
│   │   └── user-store.ts            # Zustand user store
│   │
│   └── middleware.ts                # Next.js middleware (locale/auth guard)
│
├── public/                          # Static assets
│   ├── images/                      # App images
│   └── *.svg, *.png                 # Other static files
│
├── docs/                            # Project documentation
│   ├── README.md                    # Documentation index
│   ├── BACKEND_API_REQUIREMENTS.md  # Backend API contract expected by frontend
│   ├── AI_INTEGRATION_README.md     # AI integration guide
│   ├── IMAGE_UPLOAD_README.md       # Image upload flow details
│   ├── MINIO_TROUBLESHOOTING.md     # MinIO troubleshooting notes
│   └── TASK.md                      # Task notes
│
├── check-minio.js                   # MinIO connectivity check script
├── next.config.ts                   # Next.js configuration
├── eslint.config.mjs                # ESLint configuration
├── postcss.config.mjs               # PostCSS/Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
├── .env.example                     # Example environment variables
└── README.md                        # This file
```

## Routing Overview

Main route groups under `src/app/[locale]`:

- `(auth)`
  - `/[locale]/login`
  - `/[locale]/register`
- `(user)`
  - `/[locale]/home`
  - `/[locale]/count`
- `admin`
  - `/[locale]/admin`
  - `/[locale]/admin/dashboard`
  - `/[locale]/admin/Users`
  - `/[locale]/admin/Products`
  - `/[locale]/admin/VehicleInfo`
  - `/[locale]/admin/EmployeeInfo`
  - `/[locale]/admin/SugarBagsInfo`
  - `/[locale]/admin/SugarBoxsInfo`

## Environment Variables

Copy the example file first:

```bash
cp .env.example .env
```

Commonly used variables:

- `NEXT_PUBLIC_API_URL` Backend API base URL
- `NEXT_PUBLIC_DEFAULT_LOCALE` Default application locale
- `NEXT_PUBLIC_AUTH_TOKEN_KEY` Client token key
- `NEXT_PUBLIC_ENABLE_ADMIN_PANEL` Enable/disable admin menu

## Run the Project

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Scripts

- `npm run dev` Start development server
- `npm run build` Build for production
- `npm run start` Start production server
- `npm run lint` Run lint checks

## Additional Documentation

- [Documentation Index](./docs/README.md)
- [Backend API Requirements](./docs/BACKEND_API_REQUIREMENTS.md)
- [AI Integration Guide](./docs/AI_INTEGRATION_README.md)
- [Image Upload Guide](./docs/IMAGE_UPLOAD_README.md)
- [MinIO Troubleshooting](./docs/MINIO_TROUBLESHOOTING.md)
