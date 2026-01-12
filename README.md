# uDIAL Backend API

The core backend API and worker service for the uDIAL platform, built with NestJS.

## 🚀 Features

- **Auth**: Secure authentication using Clerk.
- **Database**: PostgreSQL with Prisma ORM.
- **Queues**: Background job processing using BullMQ and Redis.
- **Storage**: File uploads managed via AWS S3 with pre-signed URLs.
- **Logging**: Sophisticated logging setup with Winston.
- **Health Checks**: Built-in health monitoring endpoints.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Queue**: [BullMQ](https://docs.bullmq.io/)
- **Runtime**: Node.js with TypeScript
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js (v20+)
- pnpm
- Docker (for PostgreSQL and Redis)

## ⚙️ Environment Variables

Create a `.env` file in the root of this directory based on the `.env.example` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/udial"
REDIS_URL="redis://localhost:6379"
CLERK_SECRET_KEY="sk_test_..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
```

## 🏃 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Database Setup
```bash
npx prisma migrate dev
```

### 3. Run the Application
```bash
# Development
pnpm start

# Watch Mode
pnpm start:dev

# Run Worker Service
pnpm start:worker
```

## 🧪 Testing

```bash
# Unit Tests
pnpm test

# E2E Tests
pnpm test:e2e

# Test Coverage
pnpm test:cov
```

## 🐳 Docker

The project includes a `Dockerfile` for containerized deployment.

```bash
docker build -t udial-api .
docker run -p 3000:3000 udial-api
```

## 📄 License

This project is private and confidential.
