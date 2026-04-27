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

# Snapshot

GET /budget/snapshot

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

GET /budget/categorygroups
POST /budget/categorygroups
PATCH /budget/categorygroups/:id
DELETE /budget/categorygroups/:id

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

### Snapshot API

**Snapshot**

- **Endpoint:** `GET /budget/snapshot`
- **Auth Required:** The user must be logged in.
- **Description:** Returns a fully hydrated, pre-normalised snapshot of the user’s budget data.
  This endpoint is designed for initial application load, allowing the frontend to bootstrap its entire state in a single request.
  The response contains denormalised and indexed entities such as transactions, accounts, categories, months, memos, and derived structures (e.g. monthKeys) optimised for UI consumption.

- **Behavior:**
  - Authenticates the request using the provided JWT token.
  - Fetches all relevant budget domain data for the authenticated user.
  - Normalises and transforms raw domain entities into a hydration-ready shape:
  - Decimal values are converted to numbers.
  - Dates are serialised into ISO strings.
  - Entities are indexed by ID for O(1) access in the frontend.
  - Derives computed structures such as:
  - monthKeys (sorted list of YYYY-MM strings derived from memo/transaction data)
  - memosByMonth (1:1 mapping of month → memo)
  - Ensures the returned payload is internally consistent (e.g. keys match indexed data).

- **Response:**
  - 200 OK — Returns a BudgetHydrationModel:
    categoryGroups — grouped category metadata (user/inflow/uncategorised)
    categories — all categories indexed by ID
    months — budget month allocations indexed by ID
    accounts — user accounts indexed by ID
    transactions — normalised transactions indexed by ID
    payees — payee metadata indexed by ID
    memosByMonth — map of YYYY-MM → memo
    monthKeys — sorted list of months present in the snapshot

```json
{
  "categoryGroups": {
    "user": {
      "cg_1": {
        "id": "cg_1",
        "name": "Bills",
        "position": 1
      }
    },
    "inflow": {
      "id": "inflow",
      "name": "Inflow",
      "position": 0
    },
    "uncategorised": {
      "id": "uncategorised",
      "name": "Uncategorised",
      "position": 999
    }
  },

  "categories": {
    "user": {
      "cat_1": {
        "id": "cat_1",
        "name": "Groceries",
        "position": 1,
        "categoryGroupId": "cg_1"
      }
    },
    "rta": {
      "id": "rta",
      "name": "Ready to Assign",
      "position": 0,
      "categoryGroupId": "cg_1"
    },
    "uncategorised": {
      "id": "uncategorised",
      "name": "Uncategorised",
      "position": 999,
      "categoryGroupId": "cg_1"
    }
  },

  "months": {
    "m_1": {
      "id": "m_1",
      "categoryId": "cat_1",
      "month": "2026-01",
      "activity": 120.5,
      "assigned": 200,
      "available": 79.5
    }
  },

  "accounts": {
    "acc_1": {
      "id": "acc_1",
      "name": "Monzo",
      "position": 1,
      "open": true,
      "type": "current",
      "deletable": true,
      "balance": 1500.25
    }
  },

  "transactions": {
    "tx_1": {
      "id": "tx_1",
      "accountId": "acc_1",
      "categoryId": "cat_1",
      "payeeId": "pay_1",
      "date": "2025-12-13T00:00:00.000Z",
      "memo": "Tesco",
      "inflow": 0,
      "outflow": 25.5
    }
  },

  "payees": {
    "pay_1": {
      "id": "pay_1",
      "name": "Tesco",
      "origin": "USER",
      "defaultCategoryId": "cat_1",
      "includeInPayeeList": true,
      "automaticallyCategorisePayee": false
    }
  },

  "memosByMonth": {
    "2026-01": {
      "id": "memo_1",
      "month": "2026-01",
      "content": "January budget notes"
    }
  },

  "monthKeys": ["2025-12", "2026-01"]
}
```

All dates are returned as ISO 8601 strings (date-time format)

- **Error Responses:**
  - 401 Unauthorized - Returned when the request is missing a valid JWT token or the token is invalid/expired.
  - 500 Internal Server Error - Returned when an unexpected error occurs during snapshot construction, such as: database failure mapping/normalisation errors inconsistent domain data

### Account API

**Edit Account**

- **Endpoint:** `PATCH /budget/account/{id}`
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
  - 401 Unauthorized - Returned when the request is missing a valid JWT token or the token is invalid/expired.
  - 400 Bad Request if invalid fields are provided (e.g., non-numeric balance)
  - 404 Not Found if the account does not exist or does not belong to the user
  - 409 Conflict if renaming to a duplicate account name

### Category API

### Category Groups API

**Get Category Groups**

- **Endpoint:** `GET /budget/categorygroups`
- **Auth Required:** The user must be logged in.
- **Description:** Fetches all category groups for the provided user id.

- **Behavior:**
  - Extracts the user identity from the authenticated session
  - Retrieves all category groups belonging to that user
  - Returns the data as a normalized lookup map

- **Response:**
  - 200 OK — Returns an object mapping category group IDs category groups:

```json
{
  "cg_1": {
    "id": "cg_1",
    "name": "Housing",
    "position": 1,
    "categories": ["cat1", "cat2"]
  },
  "cg_2": {
    "id": "cg_2",
    "name": "Food",
    "position": 2,
    "categories": ["c3", "c4"]
  }
}
```

- **Error Responses:**
  - 401 Unauthorized - Returned when the request is missing a valid JWT token or the token is invalid/expired.

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
  - 401 Unauthorized - Returned when the request is missing a valid JWT token or the token is invalid/expired.
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
  - 401 Unauthorised - Returned when the request is missing a valid JWT token or the token is invalid/expired.
  - 400 Bad Request — Payload is malformed or contains duplicate month IDs.
  - 403 Forbidden — Attempting to assign to a protected category.
  - 400 Not Found — Any month does not exist or is not owned by the user.
  - 400 Months Not Same Date — Months in the payload have different calendar dates.

# Memo API

**Update Memo**

- **Endpoint:** `PATCH /budget/memo/{id}`
- **Auth Required:** The user must be logged in.
- **Description:** Updates the memo. Only memos belonging to the user can be updated.

- **Behavior:**
  - A memo is uniquely associated with a single month.
  - Updating a memo replaces its content.
  - If the memo does not exist or is not owned by the user, an error is returned.

- **Request body example:**

```json
{
  "content": "Updated memo text"
}
```

- **Response:**
  - 200 OK — returns the updated memo:

```json
{
  "id": "memo_123",
  "month": "2026-04",
  "content": "Updated memo text"
}
```

- **Error Responses:**
  - 401 Unauthorised - Returned when the request is missing a valid JWT token or the token is invalid/expired.
  - 400 Bad Request — Payload is malformed.
  - 404 Not Found — Memo does not exist or is not owned by the user.
