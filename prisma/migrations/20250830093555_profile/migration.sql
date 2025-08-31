-- CreateTable
CREATE TABLE "public"."profiles" (
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "tsChannelId" INTEGER,
    "tsReadKey" VARCHAR(64),
    "tsWriteKey" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("userId")
);
