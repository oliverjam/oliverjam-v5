CREATE TABLE `articles` (
	`slug` text,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`intro` text NOT NULL,
	`content` text NOT NULL,
	`time` real NOT NULL,
	FOREIGN KEY (`slug`) REFERENCES `posts`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`slug` text,
	`date` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`slug`) REFERENCES `posts`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`slug` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`created` text DEFAULT current_timestamp,
	`draft` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts_tags` (
	`tag_slug` text NOT NULL,
	`article_slug` text NOT NULL,
	PRIMARY KEY(`article_slug`, `tag_slug`),
	FOREIGN KEY (`tag_slug`) REFERENCES `tags`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`article_slug`) REFERENCES `posts`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`slug` text PRIMARY KEY NOT NULL
);
