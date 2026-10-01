CREATE TABLE `blocks` (
	`userid` text NOT NULL,
	`targetid` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`userid`, `targetid`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`postid` text NOT NULL,
	`ownerid` text NOT NULL,
	`body` text NOT NULL,
	`createdat` text NOT NULL,
	`delat` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post` ON `comments` (`postid`,`delat`,`createdat`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`userid` text NOT NULL,
	`action` text NOT NULL,
	`createdat` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_events_user_time` ON `events` (`userid`,`createdat`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`userid` text NOT NULL,
	`listingid` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`createdat` text NOT NULL,
	PRIMARY KEY(`userid`, `listingid`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`listingid` text NOT NULL,
	`senderid` text NOT NULL,
	`recipientid` text NOT NULL,
	`body` text NOT NULL,
	`createdat` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inquiries_recipient` ON `inquiries` (`recipientid`,`createdat`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_sender` ON `inquiries` (`senderid`,`createdat`);--> statement-breakpoint
CREATE TABLE `market_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`sourceurl` text NOT NULL,
	`observedat` text NOT NULL,
	`fetchedat` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`ownerid` text NOT NULL,
	`objectkey` text NOT NULL,
	`type` text NOT NULL,
	`size` integer NOT NULL,
	`createdat` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_media_owner` ON `media` (`ownerid`,`createdat`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`userid` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updatedat` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`ownerid` text NOT NULL,
	`modelkey` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`data` text NOT NULL,
	`createdat` text NOT NULL,
	`updatedat` text NOT NULL,
	`delat` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_records_kind_visible` ON `records` (`kind`,`delat`,`updatedat`);--> statement-breakpoint
CREATE INDEX `idx_records_owner` ON `records` (`ownerid`,`delat`);--> statement-breakpoint
CREATE INDEX `idx_records_model_price` ON `records` (`kind`,`modelkey`,`price`);--> statement-breakpoint
CREATE TABLE `refresh_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`message` text NOT NULL,
	`startedat` text NOT NULL,
	`finishedat` text,
	`observedat` text,
	`nextat` text
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporterid` text NOT NULL,
	`targettype` text NOT NULL,
	`targetid` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT '접수' NOT NULL,
	`createdat` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reports_status` ON `reports` (`status`,`createdat`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`alias` text NOT NULL,
	`createdat` text NOT NULL
);
