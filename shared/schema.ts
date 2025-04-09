import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Topics table to store the searched/generated topics
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isBookmarked: boolean("is_bookmarked").default(false),
});

// Topic search history
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultTopicId: integer("result_topic_id").references(() => topics.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Generated reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  topicId: integer("topic_id").references(() => topics.id),
  content: text("content").notNull(),
  format: text("format").notNull(), // pdf, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User preferences
export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  theme: text("theme").default("dark"),
  fontSize: text("font_size").default("medium"),
  language: text("language").default("english"),
});

// Insert schemas
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true, createdAt: true });
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertPreferencesSchema = createInsertSchema(preferences).omit({ id: true });

// Types
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Preference = typeof preferences.$inferSelect;
export type InsertPreference = z.infer<typeof insertPreferencesSchema>;
