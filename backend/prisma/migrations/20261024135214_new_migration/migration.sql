/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "coverFrom" TEXT DEFAULT '#55643E',
ADD COLUMN     "coverTo" TEXT DEFAULT '#3E4A2C',
ADD COLUMN     "readingMinutes" INTEGER DEFAULT 1,
ALTER COLUMN "published" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
