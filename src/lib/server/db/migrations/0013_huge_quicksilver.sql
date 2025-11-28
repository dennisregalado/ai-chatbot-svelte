ALTER TABLE "Chat" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Chat" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "Message_v2" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Message_v2" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "Message_v2" ALTER COLUMN "chatId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Vote_v2" ALTER COLUMN "chatId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Vote_v2" ALTER COLUMN "messageId" SET DATA TYPE uuid;