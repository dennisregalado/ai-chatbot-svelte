CREATE TABLE `passkeys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`public_key` text NOT NULL,
	`user_id` text NOT NULL,
	`credential_id` text NOT NULL,
	`counter` integer NOT NULL,
	`device_type` text NOT NULL,
	`backed_up` integer NOT NULL,
	`transports` text,
	`created_at` integer,
	`aaguid` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `passkeys_userId_idx` ON `passkeys` (`user_id`);--> statement-breakpoint
CREATE INDEX `passkeys_credentialID_idx` ON `passkeys` (`credential_id`);--> statement-breakpoint
DROP TABLE `Document`;--> statement-breakpoint
DROP TABLE `Message_v2`;--> statement-breakpoint
DROP TABLE `Stream`;--> statement-breakpoint
DROP TABLE `Suggestion`;--> statement-breakpoint
DROP TABLE `Vote_v2`;--> statement-breakpoint
ALTER TABLE `Message` ADD `parts` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Message` ADD `attachments` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Message` DROP COLUMN `content`;