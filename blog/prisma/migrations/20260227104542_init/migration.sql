-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "seoDesc" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "conclusion" TEXT NOT NULL,
    "tags" TEXT[],
    "keywords" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_videoId_key" ON "Post"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Post_tags_idx" ON "Post"("tags");
