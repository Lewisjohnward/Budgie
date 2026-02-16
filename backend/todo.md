# TODO

# Features

- [ ] add a bootsrap backend route (maybe not needed yet)
- [ ] send 12 months of data to front end
- [ ] handle delete account
- [ ] rename memo to notes
- [ ] implement UserId
- [ ] paginate transactions for reflect
- [ ] max number of accounts/category/categoryGroup
- [ ] lock the db when creating
- [ ] think about optimistic updates in the future
- [ ] fix selectAccounts/selectCategories
- [ ] category tests
      insert
      delete - reassign transactions to new cat
      edit - position - name
- [ ] category group tests
      insert
      delete - ?? what functionality do i need
      edit - positon - name
- [ ] account
      create
      delete - ?? how to handle?
      edit - name - balance - ??type??

## Current

- [ ] need to test all transaction create inputs
- [ ] when creating/single edit handles inflow/outflow = "12.43 "
- [ ] test when editing prevent user from providing a zero value as inflow/outflow
- [ ] fix ts-ignore-error in groupTransactionsByCategoryId
- [ ] need to test to make sure months are updated correctly when editing categoryId
- [ ] in edit transaction should the repo call to get transaction be a service? - i think yes
- [ ] insert transfer transaction in insertTransaction could be extracted
- [ ] make sure that edit multiple transactions works
- [ ] remove router.patch("/", editTransaction) and controller etc
- [ ] move transaction types from schema into types file
- [ ] remove ! when adding transaction?
- [ ] in transaction utils useAccount should be replaced by createTestAccount (keep in transaction utils)
- [ ] rename createTestAccount to createAccount
- [ ] validate transaction should be a service
- [ ] rename CreatedNormalTransaction/CreatedTransferTransaction to something better

- [x] Create a create transaction service the does the type checking
- [x] when duplicating, duplicate all transactions together instead of separate, same with update account balances
- [ ] the creation of source and destination transfer transaction could be a utility
- [ ] insert transaction could be made cleaner!!
- [ ] Remove transferTransactions in splitTransactionsByType
- [ ] get updateTransactions looking swish
- [ ] check for unused imports in all git commiting files
- [ ] the transaction.controller.test has some weird separation of tests etc, check
- [ ] rename CreatedNormalTransaction because its not always created, it may have come from the db
- [ ] split transactions by type i'm not sure the transfer transactions part is used anymore
- [ ] Separate types from schemas in transaction.types

## Next

- [ ] Implement memo end point for each month
- [ ] fix prisma schema autoincrement on account
      This is a big red flag.

      autoincrement() is meant for primary keys (or at least fields backed by sequences). Using it for “ordering” is usually wrong because:

      it’s global, not per-user (so user A’s first account might be position 17 if other rows exist)

      you can’t easily insert “between” items without reindexing anyway

      Better:

      store position Int and manage it yourself (per user)

      or use createdAt for default ordering and only add position when you implement drag/drop ordering

      Also: you probably want @@index([userId, position]) if you use position.

- [ ] missing relations for category and categoryGroup
- [ ] Month.month is DateTime
      month DateTime
      @@unique([categoryId, month])

      This works but it’s easy to get subtle duplicates if the stored date isn’t normalized (timezone, “2026-01-01T00:00:00Z” vs local, etc).

      Safer patterns:

      store month as Int like 202601 (YYYYMM)

      or store a Date normalized to first-of-month in UTC and enforce normalization in code

      Right now your uniqueness relies on “everyone always writes the same DateTime”.

- [ ] Make transfers first-class: link transferAccountId as a relation, and consider a kind enum to avoid transfer detection via categoryId === null.

- [ ] Normalize Month keys (use YYYYMM int or normalized date).

## TODO: Stabilise month selection + add memos

### Goal

Make month selection and memos stable and easy to use with the date selector by introducing a backend-owned month ordering and a memo map keyed by `YYYY-MM`.

---

### Backend

- [ ] Add `monthKeys: string[]` to the categories response
  - Derive from existing normalised `months`
  - Use `YYYY-MM` (`toISOString().slice(0, 7)`)
  - Sort ascending (lexicographic)

- [ ] Add memos to the response (or a companion endpoint)
  - Fetch `MonthMemo` ordered by `month asc`
  - Build:
    - `memoByMonth: Record<string, { id; month; content }>`
    - Reuse `monthKeys` for ordering

- [ ] Ensure memos exist for all returned `monthKeys`
  - On signup: create memos for seeded months (`createMany + skipDuplicates`)
  - (Optional on read) create missing memos idempotently before returning

- [ ] Enforce canonical month identity
  - Store months normalised to month-start
  - Month identity = `YYYY-MM`

---

### Frontend

- [ ] Stop deriving month keys from `data.months`
  - Use backend-provided `data.monthKeys`

- [ ] Drive selection by month key
  - `const selectedKey = data.monthKeys[monthIndex]`
  - Memo lookup: `memoByMonth[selectedKey]`

- [ ] Compare months by month key, not full ISO strings
  - Use `toMonthKey(m.month) === selectedKey`

---

### Strategy

- No breaking refactor
- Keep existing normalised `{ categoryGroups, categories, months }`
- Only **add** `monthKeys` and `memoByMonth`

## Account

- [ ] get accounts is inside the controller! it needs to be in a service!

## Transaction

- [ ] transaction - test invariants error handling
- [ ] transaction memo is currently String? maybe should be "" ?
- [ ] edit tranaction allows setting both inflow/outflow to 0 should do the same with insert transaction
- [ ] am i preventing new transactions with both categoryId and transferAccountId?
- [ ] test that when adding a transaction memo over 100 returns 400
- [ ] Rename use-case updateTransactions to editTransactions
- [ ] transaction repo delete transactions, userId should be passed second
- [ ] Do i need to have a max size for memo?
- [ ] Validate transaction where i check for date, could be a zod schema check
- [ ] In delete transaction move the category repo call into a service
- [ ] Fix typing, some weird types
- [ ] Remove ! and ? from transaction.controller.test
- [ ] in updateMonthsActivityForTransactions THIS CAN BE OPTIMISED, ONLY NEED FROM EARLIEST DATE OF TRANSACTION[]

- [] insertMissingMonths is fetching all past months for all categories to see what the earliest month

# Category

- [ ] delete category calls a use transaction so doesn't pass tx use case SMELL!!

## Type cleanup

- [ ] Introduce mapping helpers for Prisma → Domain

- [ ] Need to pin versions in package.json

## prisma - schema

- [ ] Set max length of memo to 100

## other

- [ ] if a user is on the website from two computer and inserts a transaction at the same time, what happens? parallel vs sequential

## Auth

- [ ] all functionality is inside controller, there is no use cases, may be okay
