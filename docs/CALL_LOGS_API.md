# Call Logs API Documentation

## Overview

The Call Logs module provides a comprehensive API for managing call records in the uDial system. It supports full CRUD operations, advanced filtering, pagination, search, and statistics.

## Table of Contents

1. [Data Model](#data-model)
2. [API Endpoints](#api-endpoints)
3. [Query Parameters](#query-parameters)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Data Model

### CallLog Entity

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | UUID | Auto | Generated | Unique identifier |
| `name` | String | ✅ | - | Caller/Callee name |
| `phoneNumber` | String | ✅ | - | Phone number (format: +91 XXXXX XXXXX) |
| `callType` | Enum | ✅ | - | Type of call |
| `duration` | Integer | ❌ | 0 | Call duration in seconds |
| `simProvider` | Enum | ❌ | OTHER | SIM card provider |
| `userEmail` | String | ✅ | - | Email of the user who made/received the call |
| `callTime` | DateTime | ❌ | now() | When the call occurred |
| `notes` | String | ❌ | null | Optional notes about the call |
| `createdAt` | DateTime | Auto | now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto | Updated | Last update timestamp |

### Enums

#### CallType
- `INCOMING` - Incoming call that was answered
- `OUTGOING` - Outgoing call
- `MISSED` - Missed incoming call
- `UNANSWERED` - Outgoing call that was not answered

#### SimProvider
- `VI` - Vodafone Idea
- `JIO` - Reliance Jio
- `AIRTEL` - Bharti Airtel
- `BSNL` - BSNL
- `OTHER` - Other providers

---

## API Endpoints

All endpoints require authentication via the `Authorization` header with a valid Clerk JWT token.

### Base URL
```
/api/call-logs
```

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/call-logs` | Get all call logs with filtering |
| GET | `/api/call-logs/:id` | Get a single call log |
| POST | `/api/call-logs` | Create a new call log |
| PUT | `/api/call-logs/:id` | Update a call log |
| DELETE | `/api/call-logs/:id` | Delete a call log |
| POST | `/api/call-logs/bulk-delete` | Delete multiple call logs |
| GET | `/api/call-logs/user/:email` | Get call logs by user email |

---

## Query Parameters

### GET /api/call-logs

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number for pagination |
| `limit` | Integer | 10 | Number of items per page |
| `callType` | Enum | - | Filter by call type |
| `simProvider` | Enum | - | Filter by SIM provider |
| `userEmail` | String | - | Filter by user email |
| `search` | String | - | Search in name, phone, email |
| `startDate` | ISO Date | - | Filter calls after this date |
| `endDate` | ISO Date | - | Filter calls before this date |
| `sortBy` | String | callTime | Field to sort by |
| `sortOrder` | asc/desc | desc | Sort direction |

---

## Request/Response Examples

### 1. Get All Call Logs (with pagination)

**Request:**
```http
GET /api/call-logs?page=1&limit=10&callType=INCOMING
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Gaurav Mishra",
      "phoneNumber": "+91 99122 33445",
      "callType": "INCOMING",
      "duration": 536,
      "simProvider": "VI",
      "userEmail": "admin@unite.com",
      "callTime": "2025-12-15T15:12:00.000Z",
      "notes": null,
      "createdAt": "2025-12-15T15:12:00.000Z",
      "updatedAt": "2025-12-15T15:12:00.000Z"
    }
  ],
  "meta": {
    "total": 94,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "stats": {
    "total": 94,
    "incoming": 24,
    "outgoing": 26,
    "missed": 19,
    "unanswered": 25
  }
}
```

### 2. Get Single Call Log

**Request:**
```http
GET /api/call-logs/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Gaurav Mishra",
  "phoneNumber": "+91 99122 33445",
  "callType": "INCOMING",
  "duration": 536,
  "simProvider": "VI",
  "userEmail": "admin@unite.com",
  "callTime": "2025-12-15T15:12:00.000Z",
  "notes": null,
  "createdAt": "2025-12-15T15:12:00.000Z",
  "updatedAt": "2025-12-15T15:12:00.000Z"
}
```

### 3. Create Call Log

**Request:**
```http
POST /api/call-logs
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Sumit Patel",
  "phoneNumber": "+91 93456 78123",
  "callType": "OUTGOING",
  "duration": 365,
  "simProvider": "VI",
  "userEmail": "support@unite.com",
  "callTime": "2025-12-12T16:50:00.000Z",
  "notes": "Follow-up call about demo"
}
```

**Response (201 Created):**
```json
{
  "id": "generated-uuid",
  "name": "Sumit Patel",
  "phoneNumber": "+91 93456 78123",
  "callType": "OUTGOING",
  "duration": 365,
  "simProvider": "VI",
  "userEmail": "support@unite.com",
  "callTime": "2025-12-12T16:50:00.000Z",
  "notes": "Follow-up call about demo",
  "createdAt": "2025-12-12T16:50:00.000Z",
  "updatedAt": "2025-12-12T16:50:00.000Z"
}
```

### 4. Update Call Log

**Request:**
```http
PUT /api/call-logs/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "callType": "MISSED",
  "duration": 0,
  "notes": "Customer did not answer"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sumit Patel",
  "phoneNumber": "+91 93456 78123",
  "callType": "MISSED",
  "duration": 0,
  "simProvider": "VI",
  "userEmail": "support@unite.com",
  "callTime": "2025-12-12T16:50:00.000Z",
  "notes": "Customer did not answer",
  "createdAt": "2025-12-12T16:50:00.000Z",
  "updatedAt": "2025-12-15T10:00:00.000Z"
}
```

### 5. Delete Call Log

**Request:**
```http
DELETE /api/call-logs/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sumit Patel",
  ...
}
```

### 6. Bulk Delete

**Request:**
```http
POST /api/call-logs/bulk-delete
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "ids": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}
```

**Response:**
```json
{
  "deleted": 3
}
```

### 7. Search Call Logs

**Request:**
```http
GET /api/call-logs?search=Gaurav&callType=INCOMING&startDate=2025-12-01&endDate=2025-12-31
Authorization: Bearer <your-jwt-token>
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Invalid phone number format"],
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Call log with ID xyz not found",
  "error": "Not Found"
}
```

---

## Best Practices

### 1. Pagination
Always use pagination for list endpoints to avoid loading too much data:
```
GET /api/call-logs?page=1&limit=20
```

### 2. Filtering
Use appropriate filters to reduce response size:
```
GET /api/call-logs?callType=MISSED&userEmail=sales@unite.com
```

### 3. Date Ranges
When querying historical data, always specify date ranges:
```
GET /api/call-logs?startDate=2025-12-01&endDate=2025-12-31
```

### 4. Bulk Operations
For deleting multiple records, use the bulk delete endpoint instead of multiple DELETE requests:
```
POST /api/call-logs/bulk-delete
```

### 5. Error Handling
Always check the response status code and handle errors appropriately in your client application.

---

## Logging

All API operations are logged with the following information:
- Request method and URL
- User performing the action
- Duration of the operation
- Status code of the response

These logs are stored in the AuditLog table for compliance and debugging purposes.
