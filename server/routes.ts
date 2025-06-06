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
  // Add API endpoint for code generation
  app.post("/api/generate/code", async (req, res) => {
    try {
      const querySchema = z.object({
        prompt: z.string().min(1),
        language: z.string().default("code"),
        codeType: z.string().default("complete code solution"),
        sessionId: z.string().default('default') // Use 'default' if not provided
      });
      
      // Parse and validate the input with defaults for missing values
      const validatedData = querySchema.parse(req.body);
      const { prompt, language, codeType, sessionId } = validatedData;
      
      console.log(`Generating ${codeType} in ${language} for prompt: "${prompt.substring(0, 50)}..." with sessionId: ${sessionId}`);
      
      // Format the prompt for code generation
      const fullPrompt = `Generate ${codeType} in ${language} for: ${prompt}. 
      Format your response with the following sections:
      1. CODE: Place the fully documented code here
      2. EXPLANATION: Detailed explanation of how the code works
      
      The code should be well-documented with comments and follow best practices for ${language}.`;
      
      // Generate content using OpenRouter AI with session context
      const aiResponse = await generateAiResponse(fullPrompt, sessionId);
      
      res.json(aiResponse);
    } catch (error: any) {
      console.error("Code generation error:", error);
      res.status(500).json({ 
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack 
      });
    }
  });
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
        sessionId: z.string().default('default') // Use 'default' if not provided
      });
      
      const validatedData = querySchema.parse(req.body);
      const { prompt, sessionId } = validatedData;
      
      console.log(`Generating AI response for prompt: "${prompt.substring(0, 50)}..." with sessionId: ${sessionId}`);
      
      let aiResponse;
      
      // More precise checks for exact Sumanth Csy queries
      if ((prompt.toLowerCase().includes('sumanth') && prompt.toLowerCase().includes('csy')) || 
          (prompt.toLowerCase().includes('founder') && prompt.toLowerCase().includes('taskify')) || 
          (prompt.toLowerCase().includes('creator') && prompt.toLowerCase().includes('taskify')) ||
          (prompt.toLowerCase().includes('who') && prompt.toLowerCase().includes('made') && prompt.toLowerCase().includes('taskify'))) {
        
        console.log("Matching Sumanth Csy query, providing direct response");
        
        // Directly provide Sumanth Csy information without relying on the AI model
        aiResponse = {
          title: "About Sumanth Csy - Founder of Taskify AI",
          content: `# 🧠 Who is Sumanth Csy?

Sumanth Csy is a highly skilled AI expert, web developer, and the Founder & CEO of Taskify AI — an innovative AI-powered productivity platform. He is known for combining intelligence and creativity to build tools that make everyday digital tasks smoother and smarter.

## 🚀 About Taskify AI
Taskify AI is Sumanth's flagship project that includes:

- 🎯 PPT Generator
- 📄 PDF Creator
- 📊 Excel Automation Tool
- 💻 Code Generator
- 🤖 AI Chat Assistant

It's designed to boost productivity for students, professionals, and developers by using AI to automate and simplify tasks.

## 💼 His Skills & Expertise
- Artificial Intelligence & Machine Learning
- Full-Stack Web Development
- UI/UX Design with 3D and animated interfaces
- Android Development using Kotlin
- Microsoft Office Suite (Advanced)
- Creative Problem Solving & Tech Innovation

## 🌐 Online Presence
- 🔗 Website: sumanthcsy.netlify.app
- 📍 Based in Telangana, India`
        };
      } 
      // More precise check for Taskify AI queries (only exact matches)
      else if ((prompt.toLowerCase().includes('what is') && prompt.toLowerCase().includes('taskify')) || 
              (prompt.toLowerCase().includes('tell me about') && prompt.toLowerCase().includes('taskify')) || 
              (prompt.toLowerCase().includes('taskify ai') && prompt.toLowerCase().split(' ').length <= 3) || 
              (prompt.toLowerCase().includes('about') && prompt.toLowerCase().includes('taskify ai') && prompt.toLowerCase().split(' ').length < 5)) {
               
        console.log("Matching Taskify AI query, providing direct response");
        
        // Directly provide Taskify AI information without relying on the AI model
        aiResponse = {
          title: "Taskify AI - Productivity Platform",
          content: `# 🚀 Taskify AI: Your All-in-One Productivity Companion

Taskify AI is a comprehensive AI-powered productivity platform designed to help users create professional content efficiently and effectively. Built with ❤️ by Sumanth Csy, Taskify AI streamlines content creation and information retrieval tasks.

## 🛠️ Key Features

1. **📊 Report Generator**
   - Create comprehensive, well-structured reports on any topic
   - Export in multiple formats (PDF, Word)
   - Customize content and appearance to match your needs

2. **💻 Code Generator**
   - Generate clean, functional code snippets
   - Support for multiple programming languages
   - Smart context-aware code completion

3. **🤖 AI Assistant**
   - Engage in natural conversations
   - Get instant answers to complex questions
   - Receive step-by-step guidance for various tasks

4. **📑 Document Conversion**
   - Transform content between different formats
   - Create presentations, spreadsheets, and documents
   - Maintain formatting integrity during conversion

5. **📱 Cross-Platform Accessibility**
   - Use on desktop and mobile devices
   - Seamless synchronization across devices
   - Responsive design for optimal viewing

## 💪 Benefits

- **⏱️ Time Savings**: Automate repetitive content creation tasks
- **🎯 Quality**: Ensure consistent, high-quality output
- **🧠 Efficiency**: Focus on ideas while AI handles the execution
- **🔄 Versatility**: Address multiple content needs in one platform`
        };
      } else {
        // Regular processing for other queries
        aiResponse = await generateAiResponse(prompt, sessionId);
      }
      
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
  
  // Generate a report directly from a prompt string (without saving to DB)
  app.post("/api/reports/direct", async (req, res) => {
    try {
      const directReportSchema = z.object({
        prompt: z.string().min(1),
        title: z.string().min(1)
      });
      
      const validatedData = directReportSchema.parse(req.body);
      const { prompt, title } = validatedData;
      
      console.log(`Generating direct report: "${title}" based on prompt: "${prompt.substring(0, 50)}..."`);
      
      // Generate report content using OpenRouter AI
      const reportContent = await generateReportContent(prompt, title);
      
      // Return the report content directly
      res.json({
        title,
        content: reportContent,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Direct report generation error:", error);
      res.status(500).json({ 
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack 
      });
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
      
      // If this is a user message, generate an AI response using the chat session ID
      // to maintain conversation history
      let assistantMessage = null;
      if (role === "user") {
        try {
          // Check for direct Sumanth Csy or Taskify AI queries first
          let aiResponse: { title: string, content: string };
          
          // More precise checks for exact Sumanth Csy queries
          if ((content.toLowerCase().includes('sumanth') && content.toLowerCase().includes('csy')) || 
              (content.toLowerCase().includes('founder') && content.toLowerCase().includes('taskify')) || 
              (content.toLowerCase().includes('creator') && content.toLowerCase().includes('taskify')) ||
              (content.toLowerCase().includes('who') && content.toLowerCase().includes('made') && content.toLowerCase().includes('taskify'))) {
            
            console.log("Chat: Matching Sumanth Csy query, providing direct response");
            
            // Directly provide Sumanth Csy information without relying on the AI model
            aiResponse = {
              title: "About Sumanth Csy - Founder of Taskify AI",
              content: `# 🧠 Who is Sumanth Csy?

Sumanth Csy is a highly skilled AI expert, web developer, and the Founder & CEO of Taskify AI — an innovative AI-powered productivity platform. He is known for combining intelligence and creativity to build tools that make everyday digital tasks smoother and smarter.

## 🚀 About Taskify AI
Taskify AI is Sumanth's flagship project that includes:

- 🎯 PPT Generator
- 📄 PDF Creator
- 📊 Excel Automation Tool
- 💻 Code Generator
- 🤖 AI Chat Assistant

It's designed to boost productivity for students, professionals, and developers by using AI to automate and simplify tasks.

## 💼 His Skills & Expertise
- Artificial Intelligence & Machine Learning
- Full-Stack Web Development
- UI/UX Design with 3D and animated interfaces
- Android Development using Kotlin
- Microsoft Office Suite (Advanced)
- Creative Problem Solving & Tech Innovation

## 🌐 Online Presence
- 🔗 Website: sumanthcsy.netlify.app
- 📍 Based in Telangana, India`
            };
          } 
          // More precise check for Taskify AI queries (only exact matches)
          else if ((content.toLowerCase().includes('what is') && content.toLowerCase().includes('taskify')) || 
                  (content.toLowerCase().includes('tell me about') && content.toLowerCase().includes('taskify')) || 
                  (content.toLowerCase().includes('taskify ai') && content.toLowerCase().split(' ').length <= 3) || 
                  (content.toLowerCase().includes('about') && content.toLowerCase().includes('taskify ai') && content.toLowerCase().split(' ').length < 5)) {
                  
            console.log("Chat: Matching Taskify AI query, providing direct response");
            
            // Directly provide Taskify AI information without relying on the AI model
            aiResponse = {
              title: "Taskify AI - Productivity Platform",
              content: `# 🚀 Taskify AI: Your All-in-One Productivity Companion

Taskify AI is a comprehensive AI-powered productivity platform designed to help users create professional content efficiently and effectively. Built with ❤️ by Sumanth Csy, Taskify AI streamlines content creation and information retrieval tasks.

## 🛠️ Key Features

1. **📊 Report Generator**
   - Create comprehensive, well-structured reports on any topic
   - Export in multiple formats (PDF, Word)
   - Customize content and appearance to match your needs

2. **💻 Code Generator**
   - Generate clean, functional code snippets
   - Support for multiple programming languages
   - Smart context-aware code completion

3. **🤖 AI Assistant**
   - Engage in natural conversations
   - Get instant answers to complex questions
   - Receive step-by-step guidance for various tasks

4. **📑 Document Conversion**
   - Transform content between different formats
   - Create presentations, spreadsheets, and documents
   - Maintain formatting integrity during conversion

5. **📱 Cross-Platform Accessibility**
   - Use on desktop and mobile devices
   - Seamless synchronization across devices
   - Responsive design for optimal viewing

## 💪 Benefits

- **⏱️ Time Savings**: Automate repetitive content creation tasks
- **🎯 Quality**: Ensure consistent, high-quality output
- **🧠 Efficiency**: Focus on ideas while AI handles the execution
- **🔄 Versatility**: Address multiple content needs in one platform`
            };
          } else {
            // Pass chat ID as session ID to maintain conversation context for regular queries
            aiResponse = await generateAiResponse(content, chatId);
          }
          
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
  
  // Add API endpoint to clear chat history memory
  app.post("/api/chat/:id/clear-memory", async (req, res) => {
    try {
      const sessionId = req.params.id;
      
      // Import the function directly to avoid circular dependencies
      import('./chat-history').then(({ clearSessionHistory }) => {
        // Clear the session memory
        clearSessionHistory(sessionId);
        
        res.json({ 
          success: true, 
          message: `Chat memory cleared for session: ${sessionId}` 
        });
      }).catch(error => {
        console.error("Error importing chat-history module:", error);
        res.status(500).json({ message: "Error importing chat-history module" });
      });
    } catch (error: any) {
      console.error("Error clearing chat memory:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Add API endpoint to get all active chat memory sessions (for debugging)
  app.get("/api/chat-memory/sessions", async (req, res) => {
    try {
      // Import the function directly to avoid circular dependencies
      import('./chat-history').then(({ getAllSessions }) => {
        // Get all active sessions
        const sessions = getAllSessions();
        
        res.json({ 
          sessions,
          count: sessions.length 
        });
      }).catch(error => {
        console.error("Error importing chat-history module:", error);
        res.status(500).json({ message: "Error importing chat-history module" });
      });
    } catch (error: any) {
      console.error("Error getting chat memory sessions:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
