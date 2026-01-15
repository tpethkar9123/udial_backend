-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('INCOMING', 'OUTGOING', 'MISSED', 'UNANSWERED');

-- CreateEnum
CREATE TYPE "SimProvider" AS ENUM ('VI', 'JIO', 'AIRTEL', 'BSNL', 'OTHER');

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "callType" "CallType" NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "simProvider" "SimProvider" NOT NULL DEFAULT 'OTHER',
    "userEmail" TEXT NOT NULL,
    "callTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallLog_callType_idx" ON "CallLog"("callType");

-- CreateIndex
CREATE INDEX "CallLog_userEmail_idx" ON "CallLog"("userEmail");

-- CreateIndex
CREATE INDEX "CallLog_callTime_idx" ON "CallLog"("callTime");

-- CreateIndex
CREATE INDEX "CallLog_phoneNumber_idx" ON "CallLog"("phoneNumber");
