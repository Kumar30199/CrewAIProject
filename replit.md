# Career Coach AI - Replit Configuration

## Overview

Career Coach AI is a full-stack intelligent web application that provides personalized career guidance through AI-powered analysis. The system takes user resumes as input and delivers comprehensive career coaching including resume analysis, skill-gap detection, job matching from real-time markets, career path recommendations, and course suggestions using only free resources.

The application follows a modern full-stack architecture with a React TypeScript frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. It implements a modular AI agent system for different career coaching tasks and provides a clean, responsive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom design tokens with CSS variables for theming support

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints with structured error handling and request logging
- **File Upload**: Multer middleware for resume file processing (PDF/TXT support)
- **Agent System**: Modular Python-based AI agents for different career coaching tasks
  - Resume Analyzer Agent (spaCy, pyresparser)
  - Skill Matcher Agent (local skill database)
  - Job Scanner Agent (free APIs integration)
  - Career Recommender Agent (personalized recommendations)
- **Workflow Management**: CrewAI manager coordinates agent interactions

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Relational tables for users, resumes, skills, jobs, career paths, courses, and activities
- **In-Memory Storage**: MemStorage implementation for development/testing
- **File Storage**: Local file system for uploaded resume documents

### Authentication & Session Management
- **Session Store**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Simple user system with username/password authentication
- **Default User**: Single-user mode with "default-user" for development

### API Integration Strategy
- **Free APIs Only**: Remotive.io, JSearch via RapidAPI free tier for job data
- **Fallback Data**: Static job listings when external APIs are unavailable
- **Rate Limiting**: Built-in rate limiting for external API calls
- **Error Handling**: Graceful fallbacks to cached/static data

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting via @neondatabase/serverless
- **Connection Management**: Environment variable-based database URL configuration

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling for server-side code
- **TSX**: Development server with hot reloading

### AI/ML Libraries
- **spaCy**: Natural language processing for resume text analysis
- **pyresparser**: Resume parsing and data extraction
- **Local Datasets**: GitHub/StackOverflow trends for skill demand analysis

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon system

### File Processing
- **Multer**: Multipart form data handling for file uploads
- **PDF Processing**: Support for PDF resume parsing
- **Text Processing**: Plain text resume analysis

### Development Environment
- **Replit Integration**: Vite plugins for Replit development environment
- **Runtime Error Handling**: Custom error overlay for development
- **Cartographer**: Replit-specific development tools integration