# Testing Documentation - uDIAL Backend API

This document provides a comprehensive guide to the testing suite for the uDIAL Backend API.

## 1. Test Architecture

The testing suite is divided into two main categories:
1. **Unit Tests**: Focus on individual components and utility functions in isolation (mocked dependencies)
2. **End-to-End (e2e) Integration Tests**: Use **real database and Redis connections** to test full workflows

## 2. Prerequisites

Before running integration tests, ensure the following:

### Environment Variables
Create a `.env` file in the `apps/api` directory with:
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
REDIS_URL=redis://host:port
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Running Services
- **PostgreSQL Database**: Must be running and accessible
- **Redis Server**: Must be running and accessible
- **Prisma Migrations**: Must be applied (`npx prisma migrate deploy`)

### TLS Certificate Note
If your database uses self-signed certificates, set this environment variable:
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'
```

## 3. End-to-End Integration Tests

### 3.1 Audit Log Integration Tests (`test/audit-log.e2e-spec.ts`)

Tests the audit logging system using **real PostgreSQL and Redis connections**.

**Test Suites:**
| Suite | Tests |
|-------|-------|
| Database Connectivity | PostgreSQL connection verification |
| Redis Connectivity | Redis set/get operations |
| Create Operations | Full field logging, minimal logging, JSON details |
| Read Operations | Pagination, filtering, ordering |
| Count Operations | Count by action, non-existent action |
| Prisma Direct Operations | Complex queries, grouping |

**Run Command:**
```powershell
# PowerShell (Windows)
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx jest --config ./test/jest-e2e.json test/audit-log.e2e-spec.ts

# Bash (Linux/Mac)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config ./test/jest-e2e.json test/audit-log.e2e-spec.ts
```

---

### 3.2 Prisma/Lead Integration Tests (`test/prisma.e2e-spec.ts`)

Tests Lead CRUD operations using **real PostgreSQL database**.

**Test Suites:**
| Suite | Tests |
|-------|-------|
| Database Connectivity | Connection verification |
| Comprehensive CRUD | Create, Read, Update, Delete operations |
| Enum Values | All Priority, LeadStage, LeadStatus, LeadSource values |
| Default Values | Default enum value verification |
| Query Operations | Filtering, counting, ordering |

**Run Command:**
```powershell
# PowerShell (Windows)
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx jest --config ./test/jest-e2e.json test/prisma.e2e-spec.ts

# Bash (Linux/Mac)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config ./test/jest-e2e.json test/prisma.e2e-spec.ts
```

---

### 3.3 Leads Integration Tests (`test/leads.e2e-spec.ts`)

Tests the LeadsService layer using **real PostgreSQL database**.

**Test Suites:**
| Suite | Tests |
|-------|-------|
| Direct Database Operations | Create, FindOne, Update, FindAll, Delete, NotFoundException |
| Enum Validation | All enum values for Priority, LeadStage, LeadStatus, LeadSource |
| Default Values | Default enum values on minimal lead creation |
| Bulk Operations | Create and list multiple leads |
| Update Partial Fields | Single field update, multi-field update |
| Prisma Direct Operations | Complex queries, count by city |

**Run Command:**
```powershell
# PowerShell (Windows)
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx jest --config ./test/jest-e2e.json test/leads.e2e-spec.ts

# Bash (Linux/Mac)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config ./test/jest-e2e.json test/leads.e2e-spec.ts
```

---

### 3.4 Auth Integration Tests (`test/auth.e2e-spec.ts`)

Tests authentication flows using mocked Clerk authentication.

**Run Command:**
```powershell
npx jest --config ./test/jest-e2e.json test/auth.e2e-spec.ts
```

---

## 4. Running All Integration Tests

### Run All E2E Tests
```powershell
# PowerShell (Windows)
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx jest --config ./test/jest-e2e.json

# Bash (Linux/Mac)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx jest --config ./test/jest-e2e.json
```

### Run Specific Test Suites Together
```powershell
# Run Leads and Prisma tests together
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx jest --config ./test/jest-e2e.json test/leads.e2e-spec.ts test/prisma.e2e-spec.ts

# Run all database-related tests
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx jest --config ./test/jest-e2e.json test/leads.e2e-spec.ts test/prisma.e2e-spec.ts test/audit-log.e2e-spec.ts
```

---

## 5. Unit Tests

### Run All Unit Tests
```bash
npm run test
# or
pnpm test
```

### Run with Coverage
```bash
npm run test:cov
```

The coverage report will be generated in the `coverage/` directory.

### Unit Test Files
| File | Component |
|------|-----------|
| `src/auth/auth.guard.spec.ts` | AuthGuard |
| `src/auth/clerk.spec.ts` | Clerk JWT utilities |
| `src/health/health.controller.spec.ts` | Health endpoint |
| `src/prisma/prisma.service.spec.ts` | Prisma service |
| `src/redis/redis.service.spec.ts` | Redis service |
| `src/leads/leads.service.spec.ts` | Leads service |
| `src/leads/leads.controller.spec.ts` | Leads controller |
| `src/logs/audit-log.service.spec.ts` | Audit log service |
| `src/worker/worker.processor.spec.ts` | BullMQ worker |

---

## 6. Test Data Cleanup

All integration tests use a unique **test prefix** pattern to identify test data:
- Leads: `test-leads-e2e-*`, `test-prisma-e2e-*`
- Audit Logs: `test-audit-e2e-*`

Test data is **automatically cleaned up** in the `afterAll` hooks. If tests fail mid-execution, you can manually clean up:

```sql
-- Clean up test leads
DELETE FROM lead WHERE "leadName" LIKE 'test-%';

-- Clean up test audit logs
DELETE FROM "AuditLog" WHERE action LIKE 'test-%';
```

---

## 7. Troubleshooting

### Open Handles Warning
If you see "Jest did not exit one second after the test run has completed", use:
```bash
npx jest --config ./test/jest-e2e.json --detectOpenHandles
```

### TLS Certificate Errors
Set the environment variable to bypass TLS verification for self-signed certificates:
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'
```

### Database Connection Issues
1. Verify `DATABASE_URL` is correctly set in `.env`
2. Ensure the database server is running
3. Check network connectivity and firewall rules

### Redis Connection Issues
1. Verify `REDIS_URL` is correctly set in `.env`
2. Ensure Redis server is running
3. Check if password authentication is required

---

## 8. Quick Reference Commands

| Action | Command |
|--------|---------|
| Run all unit tests | `npm run test` |
| Run unit tests with watch | `npm run test:watch` |
| Run coverage report | `npm run test:cov` |
| Run all e2e tests | `npm run test:e2e` |
| Run specific e2e test | `npx jest --config ./test/jest-e2e.json test/<file>.e2e-spec.ts` |
| Debug open handles | `npx jest --detectOpenHandles` |

---

## 9. CI/CD Integration

For CI environments, use these npm scripts:
```json
{
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

Set environment variables in your CI configuration:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  REDIS_URL: ${{ secrets.REDIS_URL }}
  NODE_TLS_REJECT_UNAUTHORIZED: '0'
```
