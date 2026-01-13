# uDIAL Backend API

The core backend API and worker service for the uDIAL platform, built with NestJS and Prisma v7.

## 🚀 Features

- **🔐 Authentication**: Secure identity management using [Clerk](https://clerk.dev/).
- **💼 Leads Management**: Optimized CRUD for managing business leads.
- **🗄️ Database**: Prisma v7 ORM with PostgreSQL.
- **🕵️ Monitoring**: Built-in Prometheus metrics exporter at `/api/metrics`.
- **🐝 Queues**: Scalable background job processing via BullMQ and Redis.
- **☁️ Storage**: AWS S3 integration for secure file management.
- **📜 Logging**: Structured logging system powered by Winston and Custom Interceptors.
- **🏥 Health**: Robust health check endpoints for system reliability.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma v7](https://www.prisma.io/)
- **Queue**: [BullMQ](https://docs.bullmq.io/)
- **Metrics**: [Prometheus](@willsoto/nestjs-prometheus)
- **Runtime**: Node.js 20+
- **Package Manager**: pnpm

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: `npm install -g pnpm`
- **Docker**: For running PostgreSQL, Redis, and Prometheus/Grafana.

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/udial"
REDIS_URL="redis://localhost:6379"
CLERK_SECRET_KEY="sk_test_..."
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
```

## 🏃 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Database Migration
```bash
npx prisma migrate dev
```

### 3. Start the Server
```bash
# Development (Hot-reload)
pnpm start:dev

# Production Build
pnpm build
pnpm start:prod
```

### 4. Background Worker
To run the background processor independently:
```bash
pnpm start:worker
```

## 🧪 Testing & Quality
Current Coverage: 🟢 **98.1%** (Enforced Minimum: **75.0%**)

```bash
# Run all tests
pnpm test

# Run coverage locally
pnpm test:cov
```

## 🚀 CI/CD Pipeline
The API uses a scripted Jenkins pipeline (`Jenkinsfile`) for continuous delivery:
1. **Validation**: Parallel linting and coverage testing.
2. **Security**: Prisma client generation with CI-friendly placeholders.
3. **Packaging**: Multi-stage Docker build for minimal image size.
4. **Delivery**: Automatic Ansible deployment to EC2 (triggered on `main`).

## 🐳 Containerization

Build and run the API using Docker:

```bash
docker build -t udial-api .
docker run -p 3000:3000 --env-file .env udial-api
```

## 📊 Monitoring Endpoints

- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`

## 📄 License

Private and confidential.
