-- CreateTable: users (no RLS — users are not tenant-scoped)
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AlterTable: add owner_id to venues
-- NOTE: venues table is empty in dev so we can add NOT NULL directly
ALTER TABLE "venues" ADD COLUMN "owner_id" UUID NOT NULL;

-- AddForeignKey: venues.owner_id -> users.id
ALTER TABLE "venues" ADD CONSTRAINT "venues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
