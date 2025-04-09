import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAiResponse, generateReportContent, getSuggestedPrompts } from "./huggingface";
import { z } from "zod";
import { insertPromptSchema, insertReportSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all prompts
  app.get("/api/prompts", async (req, res) => {
    try {
      const prompts = await storage.getPrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get favorite prompts
  app.get("/api/prompts/favorites", async (req, res) => {
    try {
      const prompts = await storage.getFavoritePrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get suggested prompts
  app.get("/api/prompts/suggested", async (req, res) => {
    try {
      const suggestedPrompts = await getSuggestedPrompts();
      res.json({ prompts: suggestedPrompts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get prompt by id
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await storage.getPrompt(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate AI response from prompt
  app.post("/api/generate", async (req, res) => {
    try {
      const querySchema = z.object({
        prompt: z.string().min(1),
      });
      
      const validatedData = querySchema.parse(req.body);
      const { prompt } = validatedData;
      
      // Generate content using HuggingFace AI
      const aiResponse = await generateAiResponse(prompt);
      
      // Create the prompt entry
      const newPrompt = await storage.createPrompt({
        prompt: prompt,
        title: aiResponse.title,
        content: aiResponse.content,
        isFavorite: false
      });
      
      res.json(newPrompt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle favorite status for a prompt
  app.post("/api/prompts/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPrompt = await storage.toggleFavorite(id);
      
      if (!updatedPrompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(updatedPrompt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a prompt
  app.delete("/api/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePrompt(id);
      
      if (!success) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json({ message: "Prompt deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate a report for a prompt
  app.post("/api/reports", async (req, res) => {
    try {
      const reportSchema = z.object({
        promptId: z.number(),
        title: z.string()
      });
      
      const validatedData = reportSchema.parse(req.body);
      const { promptId, title } = validatedData;
      
      // Get the prompt
      const promptData = await storage.getPrompt(promptId);
      if (!promptData) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      // Generate report content using HuggingFace AI
      const reportContent = await generateReportContent(promptData.prompt, title);
      
      // Create the report
      const report = await storage.createReport({
        title,
        promptId,
        content: reportContent,
        pdfBlob: null
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

  // Get reports for a prompt
  app.get("/api/prompts/:id/reports", async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const reports = await storage.getReportsByPromptId(promptId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getPreferences();
      res.json(preferences || { id: 0, theme: "dark", fontSize: "medium" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user preferences
  app.patch("/api/preferences", async (req, res) => {
    try {
      const preferencesSchema = z.object({
        theme: z.string().optional(),
        fontSize: z.string().optional()
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
