# Sugar Sack Counter Frontend

This is a [Next.js](https://nextjs.org) project for the Sugar Sack Counter application, built with internationalization support and modern authentication.

## Environment Configuration

Before running the application, you need to set up the environment variables:

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and configure the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Authentication Configuration
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_USER_ROLE_KEY=userRole
NEXT_PUBLIC_COOKIE_AUTH_TOKEN=authToken

# Application Configuration
NEXT_PUBLIC_APP_NAME=Sugar Sack Counter
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_LOCALE=th

# Development Configuration
NEXT_PUBLIC_DEBUG=true

# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_ADMIN_PANEL=true
```

**Note:** The `.env` file contains sensitive data and should not be committed to version control. The `.env.example` file serves as a template for required environment variables.

## Getting Started

First, install dependencies and run the development server:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application supports multiple languages and includes:
- User authentication (login/register)
- Multi-language support (English/Thai)
- Responsive design
- Admin panel (if enabled)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Authentication pages
│   │   └── admin/         # Admin panel
├── components/            # Reusable React components
├── i18n/                 # Internationalization files
├── utils/                # Utility functions
│   ├── login/            # Login utilities
│   ├── register/         # Registration utilities
│   └── config.ts         # Environment configuration
```

## API Integration

The application is configured to work with a backend API. Make sure your backend server is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

Available API endpoints:
- `/auth/login` - User authentication
- `/auth/register` - User registration
- `/auth/validate` - Token validation
- `/auth/profile` - User profile
- `/auth/check-username` - Username availability
- `/auth/check-email` - Email availability
- `/auth/check-employee-code` - Employee code availability

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
