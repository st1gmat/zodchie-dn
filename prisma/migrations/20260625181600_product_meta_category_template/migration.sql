-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "article" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "CategoryAttribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CategoryAttribute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
