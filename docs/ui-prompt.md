```
You are an expert frontend developer tasked with creating a comprehensive SaaS application using Next.js 15 with App Router, TypeScript, TailwindCSS, and Radix UI. Your goal is to build a production-ready SaaS application with all essential features including authentication, payments, dashboard, email management, blog, documentation, and UI components.

## Project Context

This is a full-stack SaaS application built on Next.js 15 with App Router, designed to provide a production-ready foundation for SaaS products. It includes all essential components needed for a modern SaaS product, from authentication and payments to content management and analytics.

## Tech Stack

- Framework: Next.js 15 with App Router
- Language: TypeScript
- UI Components: Radix UI primitives
- Styling: TailwindCSS
- State Management: Zustand for client-side state
- Animations: Framer Motion
- Internationalization: next-intl
- Forms: react-hook-form with next-safe-action
- Database: PostgreSQL with Drizzle ORM
- Authentication: Better Auth with social providers (Google, GitHub)
- Payments: Stripe integration
- Email Delivery: Resend
- Content Management: Fumadocs for documentation and MDX for blog content
- AI Features: Integration with multiple AI providers
- Analytics: Multiple analytics provider support
- Storage: S3 integration for file uploads
- Code Quality: Biome for formatting and linting

## Visual Style

Create a modern, professional SaaS application with a clean and minimalist design. Use a blue-based color palette with the following colors:
- Primary: #3b82f6 (blue-500)
- Secondary: #64748b (slate-500)
- Accent: #10b981 (emerald-500)
- Background: #f8fafc (slate-50)
- Surface: #ffffff (white)
- Text: #0f172a (slate-900)
- Border: #e2e8f0 (slate-200)

Typography should use the Inter font family with a clear hierarchy:
- H1: 2.25rem, 700 weight
- H2: 1.875rem, 600 weight
- H3: 1.5rem, 600 weight
- Body: 1rem, 400 weight
- Small: 0.875rem, 400 weight

## Component Architecture

Follow a feature-based component architecture with the following directory structure:
src/
├── app/                          # Next.js app router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── (marketing)/          # Marketing pages
│   │   ├── (protected)/          # Protected user pages
│   │   ├── auth/                 # Authentication pages
│   │   ├── docs/                 # Documentation pages
│   │   └── ...                   # Other page routes
│   └── api/                      # API routes
├── components/                  # UI components
│   ├── admin/                   # Admin dashboard components
│   ├── affiliate/                # Affiliate system components
│   ├── ai-elements/              # AI feature components
│   ├── animate-ui/               # Animated UI components
│   ├── auth/                     # Authentication components
│   ├── blocks/                   # Content blocks
│   ├── blog/                     # Blog components
│   ├── changelog/                # Changelog components
│   ├── contact/                  # Contact form components
│   ├── custom/                   # Custom feature components
│   ├── dashboard/                # User dashboard components
│   ├── docs/                     # Documentation components
│   ├── icons/                    # Custom icons
│   ├── layout/                   # Layout components (header, footer)
│   ├── magicui/                  # Special UI components
│   ├── newsletter/                # Newsletter components
│   ├── page/                     # Page-specific components
│   ├── premium/                  # Premium feature components
│   ├── preview-email/            # Email preview components
│   ├── pricing/                 # Pricing components
│   ├── providers/                # React context providers
│   ├── settings/                 # User settings components
│   ├── shared/                   # Shared/reusable components
│   ├── tailark/                  # Tailwind components
│   ├── test/                     # Test components
│   ├── ui/                       # Core UI components (design system)
│   └── waitlist/                 # Waitlist components
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores
├── styles/                       # Global styles
└── providers.tsx                 # App-level providers

## Key Features to Implement

1. Authentication System:
   - Login/Register pages with email/password and social login (Google, GitHub)
   - Email verification workflow
   - Password reset functionality
   - User session management

2. Dashboard:
   - User dashboard with analytics overview
   - Recent activity feed
   - Quick action buttons
   - System status indicators

3. Email Management:
   - Email upload interface with drag-and-drop
   - Email listing with search and filtering
   - Email preview with responsive layout
   - AI analysis section (spam score, sentiment, category, tags)

4. Content Management:
   - Blog system with pagination and categories
   - Documentation system with search functionality
   - MDX support for rich content

5. Payment System:
   - Pricing page with three tiers (Free, Pro, Lifetime)
   - Stripe integration for subscriptions and one-time payments
   - Customer portal access

6. User Settings:
   - Profile management
   - Account settings
   - Billing information
   - Preference controls

7. Admin Panel:
   - User management interface
   - User banning capabilities
   - System analytics

## Implementation Requirements

1. Mobile-First Design:
   - Implement mobile layouts first, then adapt for tablet and desktop
   - Ensure touch-friendly controls and proper spacing
   - Use responsive breakpoints: sm: 640px, md: 768px, lg: 1024px, xl: 1280px

2. Accessibility:
   - Follow WCAG 2.1 AA compliance
   - Use semantic HTML and proper ARIA attributes
   - Ensure proper color contrast ratios
   - Implement keyboard navigation support

3. Performance:
   - Optimize images with Next.js Image component
   - Implement proper loading states and skeleton screens
   - Use React.memo and useMemo for performance optimization
   - Implement code splitting where appropriate

4. Internationalization:
   - Support English and Chinese locales
   - Use next-intl for internationalization
   - Ensure proper localization of dates, numbers, and currency

5. State Management:
   - Use Zustand for complex client state
   - Use React Context for simple shared state
   - Implement proper server state management with React Query

6. Forms:
   - Use react-hook-form for form handling
   - Implement proper validation with Zod
   - Provide clear error messages and validation feedback

## Specific Implementation Instructions

1. Create a responsive navigation bar with logo, main navigation links, and user menu
2. Implement a dark/light theme toggle with proper state persistence
3. Build a comprehensive dashboard with multiple widgets and charts
4. Create an email management system with upload, listing, and preview functionality
5. Implement AI analysis features for email content (spam detection, sentiment analysis)
6. Build a complete authentication flow with proper error handling
7. Create a pricing page with feature comparison table
8. Implement a blog system with category filtering and pagination
9. Build a documentation system with search functionality
10. Create user settings pages with profile, account, and billing sections

## Constraints

1. Only use the specified tech stack components
2. Follow the established directory structure
3. Maintain consistent design patterns throughout the application
4. Ensure proper TypeScript typing for all components and functions
5. Implement proper error handling and user feedback mechanisms
6. Do not modify any existing files outside of the scope of the task
7. Ensure all components are properly tested and documented

## Scope

Focus on creating the frontend components and pages for the SaaS application. Do not implement backend services or database schemas. Assume that the necessary APIs and data structures will be provided separately.

Remember that all AI-generated code will require careful human review, testing, and refinement to be considered production-ready. This prompt is meant to guide the initial scaffolding and implementation, not to create a complete, deployable application without further work.
```