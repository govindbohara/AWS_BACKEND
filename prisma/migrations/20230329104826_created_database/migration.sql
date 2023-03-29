-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "objectUrl" TEXT NOT NULL DEFAULT '',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderNumber" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
