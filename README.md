# Tuition Management System - Frontend

A production-ready, scalable Next.js 15+ project built with a feature-driven architecture.

## Architecture Overview

The project follows a modular structure to ensure scalability and maintainability:

- **`src/app`**: Next.js App Router pages and layouts.
- **`src/components`**: Reusable UI components.
  - `ui/`: Atomic components (Buttons, Inputs, etc.)
  - `layout/`: Global layout components (Navbar, Footer, Sidebar)
  - `common/`: Shared business-agnostic components
- **`src/features`**: Business logic modules. Each folder here represents a domain (e.g., `students`, `courses`, `payments`).
- **`src/services`**: API and external service integrations.
- **`src/hooks`**: Custom React hooks.
- **`src/lib`**: Third-party library configurations and utility wrappers (e.g., `axios`, `utils.js`).
- **`src/utils`**: Pure helper functions.
- **`src/store`**: State management (Zustand, Redux, or Context).
- **`src/providers`**: React Context providers.
- **`src/constants`**: Application-wide constants and configurations.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Utilities**: clsx, tailwind-merge

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Design Principles

- **Premium Aesthetics**: High-quality UI with glassmorphism, smooth transitions, and a clean typography.
- **Scalability**: Feature-based folder structure prevents the codebase from becoming a "big ball of mud".
- **Performance**: Optimized images, font loading, and server components.
