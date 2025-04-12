import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAiResponse, generateReportContent, getSuggestedPrompts } from "./openrouter";
import { z } from "zod";
import { insertPromptSchema, insertReportSchema, insertChatMessageSchema, insertChatSessionSchema } from "@shared/schema";
import { generateExcelFromPrompt, generateExcelFromReport } from "./excel-generator";
import { generatePptFromPrompt, generatePptFromReport } from "./ppt-generator";
import { generateImage, generateImageForTopic } from "./image-generator";

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
      
      // Generate content using OpenRouter AI
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
      
      // Generate report content using OpenRouter AI
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
      res.json(preferences || { id: 0, theme: "dark", fontSize: "medium", language: "english" });
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

  // Excel generation routes
  
  // Generate Excel from a prompt
  app.get("/api/prompts/:id/excel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await storage.getPrompt(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      const excelBuffer = await generateExcelFromPrompt(prompt);
      
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.set('Content-Disposition', `attachment; filename="${prompt.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx"`);
      res.set('Content-Length', excelBuffer.length.toString());
      
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate Excel from a report
  app.get("/api/reports/:id/excel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      const excelBuffer = await generateExcelFromReport(report.title, report.content);
      
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.set('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx"`);
      res.set('Content-Length', excelBuffer.length.toString());
      
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // PowerPoint generation routes
  
  // Generate PowerPoint from a prompt
  app.get("/api/prompts/:id/powerpoint", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await storage.getPrompt(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      const pptBuffer = await generatePptFromPrompt(prompt);
      
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.set('Content-Disposition', `attachment; filename="${prompt.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`);
      res.set('Content-Length', pptBuffer.length.toString());
      
      res.send(pptBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate PowerPoint from a report
  app.get("/api/reports/:id/powerpoint", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      const pptBuffer = await generatePptFromReport(report.title, report.content);
      
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.set('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`);
      res.set('Content-Length', pptBuffer.length.toString());
      
      res.send(pptBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Image generation routes
  
  // Generate an image based on prompt or topic
  app.post("/api/images/generate", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1)
      });
      
      const { prompt } = schema.parse(req.body);
      
      const imageBuffer = await generateImage(prompt);
      
      if (!imageBuffer) {
        return res.status(500).json({ message: "Failed to generate image" });
      }
      
      res.set('Content-Type', 'image/png');
      res.set('Content-Length', imageBuffer.length.toString());
      
      res.send(imageBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate an image for a topic
  app.post("/api/images/topic", async (req, res) => {
    try {
      const schema = z.object({
        topic: z.string().min(1)
      });
      
      const { topic } = schema.parse(req.body);
      
      const imageBuffer = await generateImageForTopic(topic);
      
      if (!imageBuffer) {
        return res.status(500).json({ message: "Failed to generate image" });
      }
      
      res.set('Content-Type', 'image/png');
      res.set('Content-Length', imageBuffer.length.toString());
      
      res.send(imageBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Chat API routes
  
  // Get all chat sessions
  app.get("/api/chat", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new chat session
  app.post("/api/chat", async (req, res) => {
    try {
      const schema = z.object({
        title: z.string().min(1)
      });
      
      const { title } = schema.parse(req.body);
      
      const session = await storage.createChatSession(title);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific chat session
  app.get("/api/chat/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const session = await storage.getChatSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a chat session
  app.patch("/api/chat/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const schema = z.object({
        title: z.string().min(1)
      });
      
      const { title } = schema.parse(req.body);
      
      const session = await storage.updateChatSession(id, title);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a chat session
  app.delete("/api/chat/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteChatSession(id);
      
      if (!success) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      res.json({ message: "Chat session deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get messages for a chat session
  app.get("/api/chat/:id/messages", async (req, res) => {
    try {
      const chatId = req.params.id;
      const messages = await storage.getChatMessages(chatId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Add a message to a chat session
  app.post("/api/chat/:id/messages", async (req, res) => {
    try {
      const chatId = req.params.id;
      
      // Verify the chat session exists
      const session = await storage.getChatSession(chatId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      const schema = z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1)
      });
      
      const { role, content } = schema.parse(req.body);
      
      // First add the user message
      const userMessage = await storage.addChatMessage({
        chatId,
        role,
        content
      });
      
      // If this is a user message, generate an AI response
      let assistantMessage = null;
      if (role === "user") {
        try {
          const aiResponse = await generateAiResponse(content);
          
          assistantMessage = await storage.addChatMessage({
            chatId,
            role: "assistant",
            content: aiResponse.content
          });
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          // Still return the user message even if AI response fails
        }
      }
      
      res.status(201).json({
        userMessage,
        assistantMessage
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
