
# MkSaaS Template - BMAD Method Documentation

## Background

MkSaaS (Make AI SaaS) is a comprehensive Next.js boilerplate designed to accelerate the development of profitable SaaS applications. Created by Fox, the founder of MkSaaS and Mkdirs, this template provides a complete foundation with essential SaaS features including authentication, payments, internationalization, newsletter management, dashboard, blog, documentation, and UI components.

The purpose of MkSaaS is to enable developers to build and deploy SaaS applications rapidly, reducing time-to-market from weeks to days. It's specifically designed with AI capabilities in mind, making it ideal for AI-powered SaaS products, but flexible enough for any type of SaaS application.

### Technology Stack

**Frontend & Framework:**
- Next.js 15 with App Router
- React 19
- TypeScript for type safety
- TailwindCSS for styling
- Radix UI components for accessible UI primitives
- Framer Motion for animations
- TailwindCSS Animate for animations

**Backend & Database:**
- PostgreSQL with Drizzle ORM
- Server Actions for API endpoints
- Zustand for client-side state management

**Authentication & Security:**
- Better Auth for authentication with social providers (Google, GitHub)
- Cookie-based session management
- Email verification and password reset flows

**Payment Integration:**
- Stripe for subscription and one-time payments
- Three pricing tiers (Free, Pro, Lifetime)
- Credit system with packages for pay-per-use features

**Content Management:**
- Fumadocs for documentation
- MDX for blog and content
- Internationalization with next-intl (English and Chinese locales)

**Email & Communication:**
- React Email components for responsive email templates
- Resend for email delivery
- Newsletter subscription system

**Development & Quality:**
- Biome for formatting and linting
- Knip for dependency analysis
- TypeScript for type safety
- pnpm as package manager

**Infrastructure & Deployment:**
- Cloudflare Workers compatible
- Docker support
- Environment-based configuration

## Method

The MkSaaS template follows a modular, full-stack development methodology that emphasizes separation of concerns, reusability, and scalability. The approach combines modern React development practices with server-first architecture leveraging Next.js App Router capabilities.

### Development Methodology

1. **Component-Driven Development**: UI components are built in isolation using Radix UI primitives and TailwindCSS, ensuring accessibility and consistency.

2. **Server-First Architecture**: Leveraging Next.js Server Actions and React Server Components to minimize client-side JavaScript and improve performance.

3. **Type-Safe Development**: End-to-end type safety using TypeScript across the entire stack, from database schemas to UI components.

4. **Internationalization-First**: All content is internationalized by default using next-intl, making it easy to expand to new markets.

5. **Feature Module Organization**: Related functionality is grouped into feature modules (auth, payment, content, etc.) for better maintainability.

### Coding Conventions

1. **File Structure**: Follow the established directory structure with clear separation between app routes, components, lib functions, and feature modules.

2. **Component Patterns**: 
   - Use Radix UI primitives for accessible components
   - Implement components with proper TypeScript interfaces
   - Separate presentational and logic components
   - Use compound components pattern where appropriate

3. **Server Actions**: 
   - Implement all data mutations as Server Actions
   - Use next-safe-action for validation and type safety
   - Handle errors gracefully with proper user feedback
   - Implement rate limiting and security measures

4. **State Management**: 
   - Use Server Actions for server state
   - Use Zustand for complex client state
   - Use React Context for simple shared state
   - Prefer server state over client state when possible

### Architecture

The architecture follows a layered approach:

1. **Presentation Layer**: React components in `src/app/` and `src/components/`
2. **Business Logic Layer**: Server Actions in `src/actions/` and utility functions in `src/lib/`
3. **Data Access Layer**: Drizzle ORM queries in `src/db/`
4. **External Services Layer**: Integration points for Stripe, email providers, etc.

### Development Workflow

1. **Feature Development**:
   - Create database schema changes with Drizzle
   - Implement Server Actions for data operations
   - Build UI components with TypeScript interfaces
   - Add internationalization support
   - Test with both unit and integration tests

2. **Database Management**:
   - Define schema in `src/db/schema.ts`
   - Generate migrations with `pnpm db:generate`
   - Apply migrations with `pnpm db:migrate`
   - Use `pnpm db:push` for development sync

3. **Content Management**:
   - Add MDX content to `content/` directory
   - Process with `pnpm content` command
   - Access through Fumadocs utilities

4. **Quality Assurance**:
   - Format code with `pnpm format`
   - Lint with `pnpm lint`
   - Check dependencies with `pnpm knip`
   - Run tests (when implemented)

## Application

The MkSaaS template provides a comprehensive set of modules and features essential for modern SaaS applications. Each module is designed to work independently while integrating seamlessly with the rest of the system.

### Key Modules and Features

#### Authentication System
- Email/password authentication
- Social login (Google, GitHub)
- Email verification workflow
- Password reset functionality
- User session management
- Admin user management and banning capabilities

#### Payment System
- Stripe integration for subscriptions and one-time payments
- Three-tier pricing model (Free, Pro monthly/yearly, Lifetime)
- Customer portal for subscription management
- Credit system for pay-per-use features
- Webhook handling for payment events

#### Content Management
- Blog system with pagination and categories
- Documentation powered by Fumadocs
- MDX support for rich content
- Internationalization support for all content

#### AI Features
- Integration with multiple AI providers (OpenAI, Replicate, etc.)
- Image generation capabilities
- Extensible for other AI services

#### Analytics
- Multiple analytics provider support
- Performance monitoring
- User behavior tracking

#### Storage
- S3 integration for file uploads
- File management utilities

#### Email System
- React Email templates for consistent email design
- Email development server for previewing
- Internationalization support in emails
- Newsletter subscription management

#### Internationalization
- Dual language support (English and Chinese)
- Automatic locale detection
- Translation management through JSON files

### Example Use Cases

1. **Building an AI Image Generation SaaS**:
   - Leverage the AI features module for image generation
   - Use the payment system for credit-based usage
   - Implement the authentication system for user management
   - Customize the email system for user notifications

2. **Creating a Documentation-Focused Product**:
   - Extend the Fumadocs integration for comprehensive documentation
   - Use the blog system for release notes and tutorials
   - Implement the newsletter for content distribution
   - Customize the payment system for subscription tiers

3. **Developing a Multi-Region SaaS**:
   - Expand the internationalization system for additional languages
   - Customize the content management for region-specific content
   - Use the analytics system for region-based insights
   - Implement region-specific payment methods

## Documentation

### Development Commands

**Core Development:**
- `pnpm dev` - Start development server with content collections
- `pnpm build` - Build the application and content collections
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter (use for code quality checks)
- `pnpm format` - Format code with Biome

**Database Operations (Drizzle ORM):**
- `pnpm db:generate` - Generate new migration files based on schema changes
- `pnpm db:migrate` - Apply pending migrations to the database
- `pnpm db:push` - Sync schema changes directly to the database (development only)
- `pnpm db:studio` - Open Drizzle Studio for database inspection and management

**Content and Email:**
- `pnpm content` - Process MDX content collections
- `pnpm email` - Start email template development server on port 3333

**Deployment:**
- `pnpm preview` - Build and preview the Cloudflare Workers deployment
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm upload` - Build and upload to Cloudflare Workers without deploying

**Quality Assurance:**
- `pnpm knip` - Run Knip to analyze unused files, dependencies, and exports

### Directory Structure

```
├── content/              # MDX content for docs and blog
├── messages/             # Translation files (en.json, zh.json)
├── src/
│   ├── actions/          # Server actions for API operations
│   ├── app/              # Next.js app router with internationalized routing
│   ├── components/       # Reusable React components organized by feature
│   ├── config/           # Application configuration files
│   ├── credits/          # Credit system implementation
│   ├── db/               # Database schema and migrations
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization setup
│   ├── lib/              # Utility functions and shared code
│   ├── mail/             # Email templates and mail functionality
│   ├── payment/          # Stripe payment integration
│   ├── stores/           # Zustand state management
│   └── styles/           # Global styles and Tailwind configuration
├── public/               # Static assets
```

### Configuration Files

1. **`src/config/website.tsx`** - Main website configuration
2. **`env.example`** - Environment variables template
3. **`drizzle.config.ts`** - Database configuration
4. **`biome.json`** - Code formatting and linting configuration
5. **`next.config.ts`** - Next.js configuration
6. **`tailwind.config.ts`** - TailwindCSS configuration
7. **`tsconfig.json`** - TypeScript configuration

### Best Practices

1. **Type Safety**:
   - Define TypeScript interfaces for all props and state
   - Use Zod for runtime validation
   - Leverage Drizzle's type inference for database queries

2. **Performance**:
   - Use Server Components for data fetching when possible
   - Implement proper loading states
   - Optimize images with Next.js Image component
   - Use React.memo for expensive components

3. **Security**:
   - Always validate input in Server Actions
   - Use next-safe-action for form submissions
   - Implement proper authentication checks
   - Sanitize user-generated content

4. **Maintainability**:
   - Follow the established directory structure
   - Use meaningful component and variable names
   - Comment complex logic
   - Keep components focused and single-purpose

5. **Internationalization**:
   - Externalize all user-facing text
   - Use proper namespacing for translations
   - Test with multiple locales
   - Consider text expansion in UI design

6. **Database Design**:
   - Use Drizzle's relations for proper data modeling
   - Index frequently queried columns
   - Use proper migration strategies
   - Handle database constraints appropriately