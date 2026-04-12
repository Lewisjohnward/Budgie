### All Endpoints

# Auth

POST /user/auth/register
POST /user/auth/login
POST /user/auth/logout
POST /user/auth/refresh

# Password

POST /user/password/forgot-password
POST /user/password/reset-password
PATCH /user/password/change-password (Auth Required)

# Bootstrap

GET /budget/bootstrap

# Accounts

GET /budget/account
POST /budget/account
PATCH /budget/account/:id
PATCH /budget/account/:id/close
DELETE /budget/account/:id

# Categories - Core

GET /budget/category
POST /budget/category
PATCH /budget/category/:id
DELETE /budget/category/:id

# Categories - Months

GET /budget/category/months
PATCH /budget/category/months

# Category Groups

POST /budget/categorygroup
PATCH /budget/categorygroup/:id
DELETE /budget/categorygroup/:id

# Transactions

POST /budget/transaction
POST /budget/transaction/duplicate
PATCH /budget/transaction/:id
PATCH /budget/transaction/bulk
DELETE /budget/transaction

# Payees

GET /budget/payees
PATCH /budget/payees/:id
PATCH /budget/payees/bulk
POST /budget/payees/combine
DELETE /budget/payees/:id
DELETE /budget/payees/bulk

# Memo

PATCH /budget/memo/:id

### Auth API

**Register**

- **Endpoint:** `POST /user/auth/register`
- **Description:** Registers a new user account, initialises default data (categories, memos, and system payees), and returns authentication tokens.

- **Behavior:**
  - Validates that the email is not already registered.
  - Hashes the password with a generated salt before storing.
  - Creates the user and all required default domain data.
  - Generates an access token and refresh token.
  - Stores the refresh token for future authentication.

- **Request body example:**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

- **Response:**
  - 200 OK — Returns authentication tokens

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

- **Error Responses:**
  - 400 Bad Request — Invalid email or password format
  - 409 Conflict — Email is already registered

### Account API

**Edit Account**

- **Endpoint:** `PATCH /budget/account/:id`
- **Auth Required:** The user must be logged in.
- **Description:** Updates an existing account. Supports updating the **name**, the **balance**, or both in a single request.

- **Behavior:**
  - If `balance` is provided, a **balance adjustment transaction** is automatically created to bring the account to the requested balance.
  - `balance` should be sent as a string (e.g., `"100"`) and will be converted internally to a numeric value.
  - If both `name` and `balance` are provided, both changes are applied in a single request.

- **Request body example:**

```json
{
  "name": "New Account Name",
  "balance": "100"
}
```

- **Response:**
  - 200 OK — Returns authentication tokens

- **Error Responses:**
  - 400 Bad Request if invalid fields are provided (e.g., non-numeric balance)
  - 404 Not Found if the account does not exist or does not belong to the user
  - 409 Conflict if renaming to a duplicate account name

### Category API

### Months API

**Get Months For Categories**

- **Endpoint:** `GET /budget/category/months`
- **Auth Required:** The user must be logged in.
- **Description:** Fetches all months for the provided category IDs.

- **Behavior:**
  - Returns all months belonging to the specified categories.
  - Validates that all provided category IDs exist and belong to the user.
  - If any category ID is invalid or not owned by the user, the request fails.

- **Query params:**
  - `categoryIds` (string[]) — One or more category IDs  
    Example:  
    `/budget/category/months?categoryIds=id1&categoryIds=id2`

- **Response:**
  - 200 OK — Returns an array of months

- **Error Responses:**
  - 400 Bad Request — If `categoryIds` is missing or invalid
  - 404 Not Found — If any category does not exist or is not owned by the user

**Update Months Assignments**

- **Endpoint:** `PATCH /budget/category/months`
- **Auth Required:** The user must be logged in.
- **Description:** Updates the assigned amounts for one or more months. Only months belonging to categories owned by the user can be updated. Protected categories (RTA and Uncategorised) cannot be modified.

- **Behavior:**
  - Each month can only appear once in the request payload.
  - All months in the request must share the same calendar month.
  - Updates to protected categories (RTA, Uncategorised) are forbidden.
  - The assigned change is propagated to all future months in the affected categories.
  - RTA months are recalculated automatically after updates.
  - Explicit errors are thrown if any rule is violated.

- **Request body example:**

```json
{
  "userId": "string",
  "assignments": [
    {
      "monthId": "string",
      "assigned": "string"
    }
  ]
}
```

- **Response:**
  - 200 OK — Returns an object mapping category IDs to arrays of updated month DTOs:

```json
{
  "categoryId1": [
    {
      "id": "monthId1",
      "categoryId": "categoryId1",
      "month": "2026-04-01T00:00:00.000Z",
      "assigned": "100.00",
      "available": "200.00",
      "activity": "50.00"
    }
  ],
  "categoryId2": [
    {
      "id": "monthId2",
      "categoryId": "categoryId2",
      "month": "2026-04-01T00:00:00.000Z",
      "assigned": "75.00",
      "available": "125.00",
      "activity": "25.00"
    }
  ]
}
```

- **Error Responses:**
  - 400 Bad Request — Payload is malformed or contains duplicate month IDs.
  - 403 Forbidden — Attempting to assign to a protected category.
  - 400 Not Found — Any month does not exist or is not owned by the user.
  - 400 Months Not Same Date — Months in the payload have different calendar dates.
