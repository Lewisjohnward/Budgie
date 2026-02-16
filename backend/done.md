add origin: "USER" | "SYSTEM" to BaseInsertTransactionCommand
add origin SYSTEM | USER to prisma schema
toInsertTransactionCommand sets base to origin: "USER" as const,

createOpeningBalanceTransaction origin: "SYSTEM"
createBalanceAdjustmentTransaction origin: "SYSTEM"

extract deleteTransaction useCase logic to service so deleteAccount can use it
change getTransactionsByAccountId to getTransactionIdsByAccountId
create a transaction service getTransactionsByAccountId
create a transaction service createClosingBalanceTransaction
extract deleteTransactions use case logic into deleteTransactionsById so that deleteAccount can use
create a createSystemTransaction transaction service and deduplicate createBalanceAdjustmentTransaction, createClosingBalanceTransaction, createOpeningBalanceTransaction logic

-- need to test account deletable status after

- add tx
- edit tx?
- delete tx
- duplicate tx

- - will need to set transactions of accounts to either USER or SYSTEM

- - read great gatsby in italiano
