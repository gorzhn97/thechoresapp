-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ChoreStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_members" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "HouseholdRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chore_templates" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimated_minutes" INTEGER,
    "recurrence_rule" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chore_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chore_instances" (
    "id" UUID NOT NULL,
    "template_id" UUID,
    "household_id" UUID NOT NULL,
    "assigned_to" UUID,
    "status" "ChoreStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "completed_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chore_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_lists" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_items" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "added_by" UUID NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_by" UUID,
    "checked_at" TIMESTAMP(3),
    "position" INTEGER NOT NULL,

    CONSTRAINT "shopping_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "idx_households_created_by" ON "households"("created_by");

-- CreateIndex
CREATE INDEX "idx_households_created_at" ON "households"("created_at");

-- CreateIndex
CREATE INDEX "idx_household_members_household_id" ON "household_members"("household_id");

-- CreateIndex
CREATE INDEX "idx_household_members_user_id" ON "household_members"("user_id");

-- CreateIndex
CREATE INDEX "idx_household_members_joined_at" ON "household_members"("joined_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_household_members_household_user" ON "household_members"("household_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_chore_templates_household_id" ON "chore_templates"("household_id");

-- CreateIndex
CREATE INDEX "idx_chore_templates_created_at" ON "chore_templates"("created_at");

-- CreateIndex
CREATE INDEX "idx_chore_instances_household_id" ON "chore_instances"("household_id");

-- CreateIndex
CREATE INDEX "idx_chore_instances_created_at" ON "chore_instances"("created_at");

-- CreateIndex
CREATE INDEX "idx_chore_instances_due_date" ON "chore_instances"("due_date");

-- CreateIndex
CREATE INDEX "idx_chore_instances_household_due_created" ON "chore_instances"("household_id", "due_date", "created_at");

-- CreateIndex
CREATE INDEX "idx_shopping_lists_household_id" ON "shopping_lists"("household_id");

-- CreateIndex
CREATE INDEX "idx_shopping_lists_created_at" ON "shopping_lists"("created_at");

-- CreateIndex
CREATE INDEX "idx_shopping_lists_household_created_at" ON "shopping_lists"("household_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_shopping_items_list_id" ON "shopping_items"("list_id");

-- CreateIndex
CREATE INDEX "idx_shopping_items_list_checked_position" ON "shopping_items"("list_id", "checked", "position");

-- CreateIndex
CREATE UNIQUE INDEX "uq_shopping_items_list_position" ON "shopping_items"("list_id", "position");

-- CreateIndex
CREATE INDEX "idx_activity_log_household_id" ON "activity_log"("household_id");

-- CreateIndex
CREATE INDEX "idx_activity_log_created_at" ON "activity_log"("created_at");

-- CreateIndex
CREATE INDEX "idx_activity_log_household_created_at" ON "activity_log"("household_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_activity_log_actor_id" ON "activity_log"("actor_id");

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_templates" ADD CONSTRAINT "chore_templates_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_instances" ADD CONSTRAINT "chore_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "chore_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_instances" ADD CONSTRAINT "chore_instances_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_instances" ADD CONSTRAINT "chore_instances_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_instances" ADD CONSTRAINT "chore_instances_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "shopping_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
