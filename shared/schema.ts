import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Prompts table to store user prompts and generated content
export const prompts = sqliteTable("prompts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
});

// Generated reports
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  promptId: integer("prompt_id").references(() => prompts.id),
  content: text("content").notNull(),
  pdfBlob: blob("pdf_blob", { mode: "buffer" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// User preferences
export const preferences = sqliteTable("preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  theme: text("theme").default("dark"),
  fontSize: text("font_size").default("medium"),
});

// Insert schemas
export const insertPromptSchema = createInsertSchema(prompts).omit({ 
  id: true, 
  createdAt: true 
});

export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  createdAt: true 
});

export const insertPreferencesSchema = createInsertSchema(preferences).omit({ 
  id: true 
});

// Types
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Preference = typeof preferences.$inferSelect;
export type InsertPreference = z.infer<typeof insertPreferencesSchema>;
