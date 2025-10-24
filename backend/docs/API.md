# Money Manager API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "data": {}, // Response data (on success)
  "error": "Error message", // Error message (on failure)
  "message": "Success message", // Success message (optional)
  "timestamp": "2025-10-24T08:33:57.151Z",
  "pagination": { // For paginated responses
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  },
  "message": "User registered successfully"
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
```

---

## Group Endpoints

### Get User's Groups
```http
GET /api/groups/my-groups
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "group_id",
        "name": "Family Budget",
        "currency": "USD",
        "taxRate": 8.5,
        "memberCount": 3,
        "userRole": "Owner",
        "inviteKey": "ABC123",
        "owner": {
          "name": "John Doe"
        }
      }
    ]
  }
}
```

### Create Group
```http
POST /api/groups/create
```

**Request Body:**
```json
{
  "name": "Family Budget",
  "currency": "USD",
  "taxRate": 8.5
}
```

### Join Group
```http
POST /api/groups/join
```

**Request Body:**
```json
{
  "inviteKey": "ABC123"
}
```

---

## Budget Endpoints

### Get Budgets
```http
GET /api/budgets?groupId=group_id&page=1&limit=50&isActive=true&period=monthly&category=Food
```

**Query Parameters:**
- `groupId` (optional) - Filter by group ID
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50, max: 100)
- `isActive` (optional) - Filter by active status
- `period` (optional) - Filter by period
- `category` (optional) - Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "budget_id",
      "name": "Monthly Groceries",
      "group": {
        "_id": "group_id",
        "name": "Family Budget"
      },
      "category": "Food",
      "limit": 500,
      "period": "monthly",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-31T23:59:59.999Z",
      "isActive": true,
      "spent": 350,
      "remaining": 150,
      "percentageUsed": 70,
      "status": "warning",
      "notifications": {
        "enabled": true,
        "thresholds": []
      },
      "tags": ["groceries", "food"],
      "notes": "Monthly grocery budget",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### Create Budget
```http
POST /api/budgets
```

**Request Body:**
```json
{
  "name": "Monthly Groceries",
  "group": "group_id",
  "category": "Food",
  "limit": 500,
  "period": "monthly",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "notifications": {
    "enabled": true,
    "thresholds": [
      { "percentage": 75, "notified": false },
      { "percentage": 90, "notified": false }
    ]
  },
  "tags": ["groceries", "food"],
  "notes": "Monthly grocery budget"
}
```

### Get Single Budget
```http
GET /api/budgets/:id
```

### Update Budget
```http
PUT /api/budgets/:id
```

### Delete Budget
```http
DELETE /api/budgets/:id
```

### Get Budget Analytics
```http
GET /api/budgets/:id/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "budget": {
      "_id": "budget_id",
      "name": "Monthly Groceries",
      "spent": 350,
      "remaining": 150,
      "percentageUsed": 70,
      "status": "warning"
    },
    "analytics": {
      "dailySpending": {
        "2025-10-01": 50,
        "2025-10-02": 75,
        "2025-10-03": 25
      },
      "topSpenders": [
        { "name": "John Doe", "amount": 200 },
        { "name": "Jane Doe", "amount": 150 }
      ],
      "transactionCount": 15,
      "averageTransaction": 23.33
    }
  }
}
```

---

## Transaction Endpoints

### Get Transactions
```http
GET /api/transactions?groupId=group_id&page=1&limit=50&type=expense&category=Food&startDate=2025-10-01&endDate=2025-10-31
```

### Create Transaction
```http
POST /api/transactions
```

**Request Body:**
```json
{
  "description": "Grocery shopping",
  "amount": 75.50,
  "type": "expense",
  "category": "Food",
  "group": "group_id",
  "date": "2025-10-15",
  "payer": "user_id",
  "tags": ["groceries"],
  "notes": "Weekly grocery shopping"
}
```

### Update Transaction
```http
PUT /api/transactions/:id
```

### Delete Transaction
```http
DELETE /api/transactions/:id
```

---

## Category Endpoints

### Get Categories
```http
GET /api/categories?groupId=group_id
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Food",
      "totalSpent": 1250.75,
      "transactionCount": 45,
      "lastTransaction": "2025-10-15T10:30:00.000Z",
      "budget": {
        "limit": 500,
        "period": "monthly",
        "remaining": -750.75,
        "percentageUsed": 250.15
      }
    }
  ]
}
```

### Create Category
```http
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Entertainment",
  "groupId": "group_id",
  "description": "Entertainment expenses",
  "color": "#3B82F6",
  "icon": "gamepad2"
}
```

### Update Category
```http
PUT /api/categories/:name
```

**Request Body:**
```json
{
  "newName": "Updated Category Name",
  "groupId": "group_id"
}
```

### Delete Category
```http
DELETE /api/categories/:name
```

**Request Body:**
```json
{
  "groupId": "group_id",
  "newCategory": "Other"
}
```

---

## Health Check

### Get System Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T08:33:57.151Z",
  "environment": "development",
  "database": {
    "status": "connected",
    "host": "localhost:27017",
    "name": "money-manager"
  },
  "uptime": 3600,
  "memory": {
    "used": "22 MB",
    "total": "58 MB"
  },
  "version": "1.0.0"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes  
- **File Upload**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "timestamp": "2025-10-24T08:33:57.151Z"
}
```

### Common Error Types:
- `Validation Error` - Input validation failed
- `Authentication Error` - Invalid or missing token
- `Authorization Error` - Insufficient permissions
- `Not Found` - Resource doesn't exist
- `Duplicate Error` - Resource already exists
- `Server Error` - Internal server error

---

## Examples

### Complete Budget Workflow

1. **Create a group:**
```bash
curl -X POST http://localhost:5000/api/groups/create \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Family Budget", "currency": "USD", "taxRate": 8.5}'
```

2. **Create a budget:**
```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Monthly Groceries", "group": "group_id", "category": "Food", "limit": 500, "period": "monthly"}'
```

3. **Add transactions:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"description": "Grocery shopping", "amount": 75.50, "type": "expense", "category": "Food", "group": "group_id"}'
```

4. **Check budget status:**
```bash
curl -X GET http://localhost:5000/api/budgets/budget_id \
  -H "Authorization: Bearer your-token"
```
