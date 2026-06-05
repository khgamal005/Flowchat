# Flowchat - Slack Clone Application

## Overview
Flowchat is a full-featured team collaboration platform inspired by Slack, built with modern web technologies. It enables real-time communication through channels, workspaces, direct messages, and video calls.

## Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **TipTap** - Rich text editor for messages
- **LiveKit Components** - Video conferencing UI

### Backend & Database
- **Prisma ORM** - Database toolkit with PostgreSQL
- **Neon Database** - Serverless PostgreSQL
- **NextAuth.js** - Authentication (v5 beta)
- **Socket.io** - Real-time bidirectional communication
- **LiveKit Server SDK** - Video call infrastructure

### Additional Services
- **UploadThing** - File upload handling
- **React Hook Form** - Form handling with Zod validation

## Core Features

### 1. Workspaces
- **Multi-workspace support** - Users can create and manage multiple workspaces
- **Workspace roles** - SuperAdmin, Members, and Regulators with different permission levels
- **Invite system** - Unique invite codes for workspace onboarding
- **Workspace customization** - Custom names, slugs, and profile images
- **Member management** - Add/remove members and assign roles

### 2. Channels
- **Channel creation** - Create channels within workspaces for organized discussions
- **Channel membership** - Users can join channels they have access to
- **Channel regulators** - Designated users with channel management permissions
- **Real-time messaging** - Instant message delivery using Socket.io
- **Message history** - Persistent message storage with timestamps
- **Rich text editing** - Format messages with TipTap editor (bold, italic, lists, etc.)
- **File attachments** - Upload and share files in channels
- **Emoji support** - Emoji picker for message reactions

### 3. Direct Messages
- **One-on-one messaging** - Private conversations between users
- **Real-time delivery** - Instant message updates via WebSocket
- **Message persistence** - Store and retrieve direct message history
- **File sharing** - Send files in direct messages
- **User presence** - Track online/offline status and away states

### 4. Video Calls
- **LiveKit integration** - Professional-grade video conferencing
- **Audio & Video** - Full audio/video call capabilities
- **Room-based calls** - Unique rooms for each conversation
- **Real-time connection** - Low-latency WebRTC connections
- **Multi-participant support** - Conference-style video calls
- **Screen sharing** - Built-in screen sharing functionality

### 5. Authentication & Security
- **Email/password authentication** - Secure user registration and login
- **Session management** - Secure session handling with NextAuth
- **Email verification** - Optional email verification flow
- **Protected routes** - Route-level authentication checks
- **API security** - Server actions and API route protection

### 6. User Experience
- **Responsive design** - Mobile-friendly interface
- **Dark mode** - Theme switching with next-themes
- **Search functionality** - Search across messages and channels
- **User profiles** - Custom avatars and profile information
- **Status indicators** - Online/offline/away status display
- **Loading states** - Smooth loading animations and skeletons

## Database Schema

### Key Models
- **User** - User accounts with authentication data
- **Workspace** - Team workspaces with role-based access
- **Channel** - Communication channels within workspaces
- **Message** - Channel messages with content and attachments
- **DirectMessage** - Private messages between users
- **WorkspaceMember/Regulator** - Workspace role management
- **ChannelMember/Regulator** - Channel role management

### Relationships
- Users can belong to multiple workspaces
- Workspaces contain multiple channels
- Channels have multiple members and messages
- Direct messages connect two users
- Hierarchical permission system (SuperAdmin > Regulator > Member)

## Architecture Highlights

### Real-time Communication
- **Socket.io server** - Custom WebSocket server for instant messaging
- **Event-driven updates** - Real-time message broadcasting
- **Room-based channels** - Organized Socket.io rooms for channels

### File Handling
- **UploadThing integration** - Secure file upload service
- **AWS S3** - Scalable cloud storage for files
- **Presigned URLs** - Secure file access with temporary tokens

### State Management
- **Zustand stores** - Lightweight global state management
- **React Query** - Server state caching and synchronization
- **Server Actions** - Type-safe server mutations

### Performance Optimizations
- **Next.js App Router** - Optimized routing and code splitting
- **Image optimization** - Next.js Image component for performance
- **Lazy loading** - Component-level code splitting
- **Database indexing** - Optimized queries with proper indexes

## Development Features

### Code Quality
- **ESLint** - Code linting and formatting
- **TypeScript** - Full type safety across the codebase
- **Prisma migrations** - Version-controlled database schema
- **Environment variables** - Secure configuration management

### Developer Experience
- **Hot reload** - Fast development with Next.js dev server
- **API routes** - RESTful API endpoints
- **Server actions** - Direct database mutations from components
- **Component library** - Reusable UI components with shadcn/ui

## Deployment Ready
- **Vercel compatible** - Optimized for Vercel deployment
- **Environment configuration** - Production-ready environment setup
- **Database migrations** - Automated schema deployment
- **Asset optimization** - Built-in optimization for images and scripts

## Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (LiveKit, messages, upload)
│   ├── (main)/         # Main application layout
│   └── workspace/      # Workspace-specific pages
├── actions/            # Server actions for mutations
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── video-chat.tsx # Video call component
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── types/             # TypeScript type definitions
└── providers/         # Context providers
```

## Key Achievements
- Built a complete real-time collaboration platform from scratch
- Implemented professional video conferencing with LiveKit
- Created a scalable multi-tenant architecture with workspaces
- Designed a flexible permission system with roles
- Integrated multiple third-party services (auth, storage, video)
- Maintained type safety across the entire application
- Optimized for performance with modern React patterns
