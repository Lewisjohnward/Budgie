-- CreateTable
CREATE TABLE "MonthMemo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "MonthMemo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthMemo_userId_month_key" ON "MonthMemo"("userId", "month");

-- AddForeignKey
ALTER TABLE "MonthMemo" ADD CONSTRAINT "MonthMemo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
