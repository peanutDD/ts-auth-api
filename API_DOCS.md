# API Documentation

## Users Endpoints

### Get Current User

**Endpoint:** `GET /api/users/me`

**Description:** Retrieve the currently authenticated user's profile information.

**Authentication Required:** Yes (Bearer token)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: If no token is provided or token is invalid/expired

### Register User

**Endpoint:** `POST /api/users/register`

**Description:** Create a new user account.

**Authentication Required:** No

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

### Login User

**Endpoint:** `POST /api/users/login`

**Description:** Authenticate a user and return a JWT token.

**Authentication Required:** No

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "token": "string"
  }
}
```