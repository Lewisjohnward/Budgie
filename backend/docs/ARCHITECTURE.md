### Account API

**Edit Account**

- **Endpoint:** `PATCH /accounts/:id`
- **Description:** Updates an existing account - accepts balance and/or name.
- **Request body:**

  ```json
  {
    "userId": "uuid",
    "accountId": "uuid",
    "name": "New Account Name",
    "balance": "100"
  }
  ```

  it("Should return 400 when providing no updates - neither balanceAdjustment or name", async () => {
  router.get("/", getAccounts);
  router.post("/", addAccount);
  router.patch("/:id", editAccount);
  router.patch("/:id/open", toggleAccountOpen);
  router.delete("/:id", deleteAccount);
