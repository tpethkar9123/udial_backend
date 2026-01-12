# Testing Documentation - Clerk Auth Feature

This document provides an overview of the testing suite implemented for the Clerk Authentication feature in the uDIAL Backend API.

## 1. Test Architecture

The testing suite is divided into two main categories:
1. **Unit Tests**: Focus on individual components and utility functions in isolation.
2. **End-to-End (e2e) Tests**: Focus on the integration of multiple components and the overall request lifecycle.

## 2. Unit Tests

### AuthGuard (`src/auth/auth.guard.spec.ts`)
The `AuthGuard` is responsible for protecting routes and verifying the `Authorization` header.
- **Tests Implemented**:
  - **Sanity Check**: Ensures the guard is correctly defined and injectable.
  - **Missing Header**: Verifies that requests without an `Authorization` header are rejected with a `401 Unauthorized` status.
  - **Invalid Token**: Verifies that malformed or invalid JWTs are rejected.
  - **Success Flow**: Verifies that a valid token results in a `true` return value and properly attaches the user object to the request.

### Modules (`src/**/*.module.ts`)
Module tests ensure that dependencies are correctly registered and exported.
- **Modules Covered**: `AuthModule`, `HealthModule`, `PrismaModule`, `RedisModule`.

### Health Check (`src/health/health.controller.spec.ts`)
- **Tests Implemented**:
  - Verifies that the `/health` endpoint returns `{ status: 'ok' }`.

### Prisma Service (`src/prisma/prisma.service.spec.ts`)
- **Tests Implemented**:
  - Verifies database connection initialization on module startup.

### Redis Service (`src/redis/redis.service.spec.ts`)
- **Tests Implemented**:
  - **Environment Check**: Verifies that an error is thrown if `REDIS_URL` is missing.
  - **Data Operations**: Verifies `get` and `set` (with/without TTL) work correctly using a mocked `ioredis` instance.

### Clerk Utilities (`src/auth/clerk.spec.ts`)
The `verifyJwt` utility is the core logic for interacting with the `@clerk/backend` SDK.
- **Tests Implemented**:
  - **Stateless Verification**: Mocks the SDK to simulate RSA public key verification of the JWT.
  - **Stateful Enrichment**: Verifies that the code correctly fetches detailed user profile information using the `subject` claim (User ID).
  - **Failure Modes**: Verifies correct handling of missing JWT claims or failed network calls to the Clerk API.

## 3. End-to-End (e2e) Tests

### Auth Integration (`test/auth.e2e-spec.ts`)
These tests bootstrap the entire NestJS application and use `supertest` to make actual HTTP requests.
- **Scenarios Covered**:
  - **Unauthenticated Access**: Hits `/api/users` with no header and expects failure.
  - **Bad Token Access**: Hits `/api/users` with a fake token and expects failure.
  - **Authenticated Access**: Hits `/api/users` with a mocked valid session and expects a `200 OK` response.

  - **Authenticated Access**: Hits `/api/users` with a mocked valid session and expects a `200 OK` response.

### Prisma Integration (`test/prisma.e2e-spec.ts`)
These tests perform real CRUD operations against the PostgreSQL database.
- **Scenarios Covered**:
  - **User Creation**: Creates a user and verifies all fields are persisted.
  - **User Retrieval**: Verifies that a user can be found by unique fields.
  - **Lead Creation**: Verifies lead record persistence.
  - **Lead Retrieval**: Verifies lead lookup.
- **Cleanup**: The tests automatically delete all test records created during the run (targeted by email domain `test-prisma-e2e.com`).

## 4. How to Run Tests

Ensure you have installed the dependencies first:
```bash
npm install
```

### Run All Unit Tests
```bash
npm run test
```

### Run e2e Tests
```bash
npm run test:e2e
```

### Generate Coverage Report
```bash
npm run test:cov
```
The report will be available in the `coverage/` directory.

## 5. Mocking Strategy
To avoid dependency on actual Clerk API keys during testing:
- We use **local mocking** for the `@clerk/backend` package using `jest.mock`.
- We use **spyOn** for the `clerk.ts` utility functions in high-level guard tests to control flow.
