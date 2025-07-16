# Blood Flow Simulator

## Overview

This is a React-based interactive educational tool for demonstrating blood flow dynamics in blood vessels. The application simulates how vessel constriction affects blood flow and pressure, providing an engaging learning experience for understanding cardiovascular physiology.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives for accessible, customizable components
- **State Management**: React hooks for local state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migration**: Drizzle Kit for database schema management
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

## Key Components

### Simulation Engine
- **Physics Calculations**: Implements blood flow equations based on pressure differentials and vessel resistance
- **Real-time Updates**: Dynamic recalculation of flow rates based on user input
- **Particle Animation**: Canvas-based particle system for visual flow representation

### User Interface
- **Interactive Controls**: Sliders for adjusting upstream pressure, downstream pressure, and vessel constriction
- **Visual Feedback**: Real-time display of calculated flow rates and pressure values
- **Responsive Design**: Mobile-optimized interface with adaptive layouts
- **Accessibility**: ARIA-compliant components from Radix UI

### Educational Features
- **Parameter Visualization**: Clear display of how changes affect blood flow
- **Real-time Calculations**: Immediate feedback on parameter adjustments
- **Mobile Support**: Touch-friendly controls for mobile devices

## Data Flow

1. **User Input**: Slider components capture user adjustments to simulation parameters
2. **Physics Calculation**: React effects trigger recalculation of flow dynamics using fluid dynamics equations
3. **Visual Updates**: Canvas rendering system updates particle animations and flow visualization
4. **State Management**: React hooks manage component state and trigger re-renders

## External Dependencies

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built accessible component library
- **Radix UI**: Headless UI primitives for interactive components
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESLint/Prettier**: Code formatting and linting (implied from structure)

### Database and Backend
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database operations
- **Express.js**: Web server framework

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with HMR for frontend, tsx for backend
- **Database**: Connection to Neon Database via DATABASE_URL environment variable
- **Hot Reload**: Automatic refresh for both client and server code changes

### Production Build
- **Frontend Build**: Vite builds optimized static assets to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Environment**: NODE_ENV-based configuration switching

### Database Management
- **Schema**: Centralized schema definition in `shared/schema.ts`
- **Migrations**: Drizzle Kit manages database schema changes
- **Connection**: Environment-based database URL configuration

The application is designed as a single-page educational tool with potential for future expansion into a full-featured physiology simulation platform. The modular architecture allows for easy addition of new simulation types and educational content.

## Recent Changes

### July 16, 2025 - Web Hosting Preparation
- Integrated the complete Blood Flow Simulator with interactive controls
- Fixed pressure chart display using ResponsiveContainer from Recharts
- Restored original particle animation system for smooth blood flow visualization
- Enhanced mobile responsiveness and user interface styling
- Added proper SEO meta tags for web deployment
- Application is now ready for online hosting with full functionality

### Key Features Implemented
- **Interactive Canvas Animation**: Real-time blood particle flow through constricted vessel
- **Pressure Visualization**: Dynamic chart showing pressure changes along vessel length
- **Responsive Controls**: Touch-friendly sliders for pressure and constriction adjustment
- **Mobile Optimization**: Adaptive layouts for all device sizes
- **Educational Content**: Comprehensive information about blood flow physics

The simulator successfully demonstrates cardiovascular physiology principles through interactive visualization and is prepared for web deployment.