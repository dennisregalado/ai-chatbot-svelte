CREATE TABLE IF NOT EXISTS `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `accounts_userId_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text,
	`team_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`inviter_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `invitations_organizationId_idx` ON `invitations` (`organization_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `invitations_email_idx` ON `invitations` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `members_organizationId_idx` ON `members` (`organization_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `members_userId_idx` ON `members` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`scope_id` text,
	`scope` text,
	`key` text,
	`value` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`timezone` text,
	`city` text,
	`country` text,
	`region` text,
	`region_code` text,
	`colo` text,
	`latitude` text,
	`longitude` text,
	`active_organization_id` text,
	`active_team_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sessions_userId_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `teamMembers_teamId_idx` ON `team_members` (`team_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `teamMembers_userId_idx` ON `team_members` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `teams_organizationId_idx` ON `teams` (`organization_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`r2_key` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`category` text,
	`is_public` integer,
	`description` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`should_onboard` integer,
	`completed_steps` text,
	`first_name` text,
	`last_name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `verifications_identifier_idx` ON `verifications` (`identifier`);