import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTopicContent, generateReportContent, getSuggestedTopics, getCategoryTopics } from "./openai";
import { z } from "zod";
import { insertTopicSchema, insertSearchHistorySchema, insertReportSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all topics
  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get topic by id
  app.get("/api/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getTopic(id);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get topics by category
  app.get("/api/topics/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const topics = await storage.getTopicsByCategory(category);
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search for a topic
  app.post("/api/topics/search", async (req, res) => {
    try {
      const querySchema = z.object({
        query: z.string().min(1),
      });
      
      const validatedData = querySchema.parse(req.body);
      const { query } = validatedData;
      
      // Generate topic content using OpenAI
      const topicContent = await generateTopicContent(query);
      
      // Create the topic
      const newTopic = await storage.createTopic({
        title: topicContent.title,
        description: topicContent.description,
        content: topicContent.content,
        category: topicContent.category,
        tags: topicContent.tags,
        isBookmarked: false
      });
      
      // Add to search history
      await storage.createSearchHistory({
        query: query,
        resultTopicId: newTopic.id
      });
      
      res.json(newTopic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get suggested topics
  app.get("/api/topics/suggested", async (req, res) => {
    try {
      const suggestedTopics = await getSuggestedTopics();
      res.json({ topics: suggestedTopics });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get topics for a specific category
  app.get("/api/categories/:category/topics", async (req, res) => {
    try {
      const category = req.params.category;
      const topics = await getCategoryTopics(category);
      res.json({ topics });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bookmark a topic
  app.post("/api/topics/:id/bookmark", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTopic = await storage.bookmarkTopic(id);
      
      if (!updatedTopic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(updatedTopic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get search history
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getSearchHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Clear search history
  app.delete("/api/history", async (req, res) => {
    try {
      await storage.clearSearchHistory();
      res.json({ message: "Search history cleared" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate a report for a topic
  app.post("/api/reports", async (req, res) => {
    try {
      const reportSchema = z.object({
        topicId: z.number(),
        title: z.string(),
        format: z.string().default("pdf")
      });
      
      const validatedData = reportSchema.parse(req.body);
      const { topicId, title, format } = validatedData;
      
      // Get the topic
      const topic = await storage.getTopic(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // Generate report content using OpenAI
      const reportContent = await generateReportContent(topic);
      
      // Create the report
      const report = await storage.createReport({
        title,
        topicId,
        content: reportContent,
        format
      });
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a report by id
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get reports for a topic
  app.get("/api/topics/:id/reports", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const reports = await storage.getReportsByTopicId(topicId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getPreferences();
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user preferences
  app.patch("/api/preferences", async (req, res) => {
    try {
      const preferencesSchema = z.object({
        theme: z.string().optional(),
        fontSize: z.string().optional(),
        language: z.string().optional()
      });
      
      const validatedData = preferencesSchema.parse(req.body);
      const updatedPreferences = await storage.updatePreferences(validatedData);
      res.json(updatedPreferences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
