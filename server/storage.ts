import { 
  Prompt, InsertPrompt,
  Report, InsertReport,
  ChatMessage, InsertChatMessage,
  ChatSession, InsertChatSession,
  Preference, InsertPreference
} from "@shared/schema";
import { db, rawDb } from "./db";
import { prompts, reports, chatMessages, chatSessions, preferences } from "@shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export interface IStorage {
  // Prompts
  getPrompt(id: number): Promise<Prompt | undefined>;
  getPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: number): Promise<boolean>;
  toggleFavorite(id: number): Promise<Prompt | undefined>;
  getFavoritePrompts(): Promise<Prompt[]>;

  // Reports
  getReport(id: number): Promise<Report | undefined>;
  getReportsByPromptId(promptId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<boolean>;
  
  // Chat
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(title: string): Promise<ChatSession>;
  updateChatSession(id: string, title: string): Promise<ChatSession | undefined>;
  deleteChatSession(id: string): Promise<boolean>;
  getChatMessages(chatId: string): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Preferences
  getPreferences(): Promise<Preference | undefined>;
  updatePreferences(prefs: Partial<InsertPreference>): Promise<Preference>;
}

export class DatabaseStorage implements IStorage {
  // Prompts
  async getPrompt(id: number): Promise<Prompt | undefined> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM prompts WHERE id = ?');
      const result = stmt.get(id);
      return result as Prompt | undefined;
    } catch (error) {
      console.error('Error getting prompt:', error);
      return undefined;
    }
  }

  async getPrompts(): Promise<Prompt[]> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM prompts ORDER BY created_at DESC');
      const results = stmt.all();
      return results as Prompt[];
    } catch (error) {
      console.error('Error getting prompts:', error);
      return [];
    }
  }

  async createPrompt(promptData: InsertPrompt): Promise<Prompt> {
    try {
      // Ensure all values are proper SQLite types
      const prompt = String(promptData.prompt);
      const content = String(promptData.content);
      const title = String(promptData.title);
      const isFavorite = promptData.isFavorite === true ? 1 : 0;
      
      console.log('Creating prompt with data:', {
        prompt,
        title,
        contentLength: content.length,
        isFavorite
      });
      
      const stmt = rawDb.prepare(
        'INSERT INTO prompts (prompt, content, title, is_favorite) VALUES (?, ?, ?, ?)'
      );
      const result = stmt.run(
        prompt,
        content,
        title,
        isFavorite
      );
      
      const id = result.lastInsertRowid as number;
      return this.getPrompt(id) as Promise<Prompt>;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw new Error('Failed to create prompt');
    }
  }

  async updatePrompt(id: number, promptUpdate: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (promptUpdate.prompt !== undefined) {
        fields.push('prompt = ?');
        values.push(promptUpdate.prompt);
      }
      
      if (promptUpdate.content !== undefined) {
        fields.push('content = ?');
        values.push(promptUpdate.content);
      }
      
      if (promptUpdate.title !== undefined) {
        fields.push('title = ?');
        values.push(promptUpdate.title);
      }
      
      if (promptUpdate.isFavorite !== undefined) {
        fields.push('is_favorite = ?');
        values.push(promptUpdate.isFavorite);
      }
      
      if (fields.length === 0) {
        return this.getPrompt(id);
      }
      
      values.push(id);
      const stmt = rawDb.prepare(
        `UPDATE prompts SET ${fields.join(', ')} WHERE id = ?`
      );
      stmt.run(...values);
      
      return this.getPrompt(id);
    } catch (error) {
      console.error('Error updating prompt:', error);
      return undefined;
    }
  }

  async deletePrompt(id: number): Promise<boolean> {
    try {
      const stmt = rawDb.prepare('DELETE FROM prompts WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }
  }

  async toggleFavorite(id: number): Promise<Prompt | undefined> {
    try {
      const prompt = await this.getPrompt(id);
      if (!prompt) return undefined;
      
      const stmt = rawDb.prepare('UPDATE prompts SET is_favorite = ? WHERE id = ?');
      stmt.run(!prompt.isFavorite, id);
      
      return this.getPrompt(id);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      return undefined;
    }
  }

  async getFavoritePrompts(): Promise<Prompt[]> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM prompts WHERE is_favorite = 1 ORDER BY created_at DESC');
      const results = stmt.all();
      return results as Prompt[];
    } catch (error) {
      console.error('Error getting favorite prompts:', error);
      return [];
    }
  }

  // Reports
  async getReport(id: number): Promise<Report | undefined> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM reports WHERE id = ?');
      const result = stmt.get(id);
      return result as Report | undefined;
    } catch (error) {
      console.error('Error getting report:', error);
      return undefined;
    }
  }

  async getReportsByPromptId(promptId: number): Promise<Report[]> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM reports WHERE prompt_id = ? ORDER BY created_at DESC');
      const results = stmt.all(promptId);
      return results as Report[];
    } catch (error) {
      console.error('Error getting reports for prompt:', error);
      return [];
    }
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    try {
      // Ensure all values are proper SQLite types
      const title = String(reportData.title);
      const promptId = Number(reportData.promptId);
      const content = String(reportData.content);
      const pdfBlob = reportData.pdfBlob || null;
      
      console.log('Creating report with data:', {
        title,
        promptId,
        contentLength: content.length
      });
      
      const stmt = rawDb.prepare(
        'INSERT INTO reports (title, prompt_id, content, pdf_blob) VALUES (?, ?, ?, ?)'
      );
      const result = stmt.run(
        title,
        promptId,
        content,
        pdfBlob
      );
      
      const id = result.lastInsertRowid as number;
      return this.getReport(id) as Promise<Report>;
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error('Failed to create report');
    }
  }

  async deleteReport(id: number): Promise<boolean> {
    try {
      const stmt = rawDb.prepare('DELETE FROM reports WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }
  
  // Chat methods
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      // Ensure the chat_sessions table exists
      try {
        const tableCheckStmt = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_sessions'");
        const tableExists = tableCheckStmt.get();
        
        if (!tableExists) {
          // Create the tables if they don't exist
          console.log('Creating chat tables...');
          const createSessionsTableStmt = rawDb.prepare(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
              updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
            )
          `);
          createSessionsTableStmt.run();
          
          const createMessagesTableStmt = rawDb.prepare(`
            CREATE TABLE IF NOT EXISTS chat_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              chat_id TEXT NOT NULL,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
            )
          `);
          createMessagesTableStmt.run();
        }
      } catch (error) {
        console.log('Error checking chat tables existence:', error);
      }
    
      const stmt = rawDb.prepare('SELECT * FROM chat_sessions ORDER BY updated_at DESC');
      const results = stmt.all();
      return results as ChatSession[];
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }
  
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM chat_sessions WHERE id = ?');
      const result = stmt.get(id);
      return result as ChatSession | undefined;
    } catch (error) {
      console.error('Error getting chat session:', error);
      return undefined;
    }
  }
  
  async createChatSession(title: string): Promise<ChatSession> {
    try {
      const id = uuidv4();
      const now = Date.now();
      
      const stmt = rawDb.prepare(
        'INSERT INTO chat_sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
      );
      stmt.run(id, title, now, now);
      
      return {
        id,
        title,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      } as ChatSession;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }
  
  async updateChatSession(id: string, title: string): Promise<ChatSession | undefined> {
    try {
      const now = Date.now();
      
      const stmt = rawDb.prepare(
        'UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?'
      );
      const result = stmt.run(title, now, id);
      
      if (result.changes === 0) {
        return undefined;
      }
      
      return this.getChatSession(id);
    } catch (error) {
      console.error('Error updating chat session:', error);
      return undefined;
    }
  }
  
  async deleteChatSession(id: string): Promise<boolean> {
    try {
      // Delete messages first (foreign key constraint)
      const deleteMessagesStmt = rawDb.prepare('DELETE FROM chat_messages WHERE chat_id = ?');
      deleteMessagesStmt.run(id);
      
      // Delete session
      const deleteSessionStmt = rawDb.prepare('DELETE FROM chat_sessions WHERE id = ?');
      const result = deleteSessionStmt.run(id);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }
  }
  
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC');
      const results = stmt.all(chatId);
      return results as ChatMessage[];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }
  
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const stmt = rawDb.prepare(
        'INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)'
      );
      const result = stmt.run(
        message.chatId,
        message.role,
        message.content
      );
      
      // Update the chat session's updated_at timestamp
      const updateSessionStmt = rawDb.prepare(
        'UPDATE chat_sessions SET updated_at = ? WHERE id = ?'
      );
      updateSessionStmt.run(Date.now(), message.chatId);
      
      const id = result.lastInsertRowid as number;
      
      const getMessageStmt = rawDb.prepare('SELECT * FROM chat_messages WHERE id = ?');
      const newMessage = getMessageStmt.get(id);
      
      return newMessage as ChatMessage;
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw new Error('Failed to add chat message');
    }
  }

  // Preferences
  async getPreferences(): Promise<Preference | undefined> {
    try {
      const stmt = rawDb.prepare('SELECT * FROM preferences LIMIT 1');
      const result = stmt.get();
      return result as Preference | undefined;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return undefined;
    }
  }

  async updatePreferences(prefsUpdate: Partial<InsertPreference>): Promise<Preference> {
    try {
      // First, try to check if the preferences table exists
      try {
        const tableCheckStmt = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='preferences'");
        const tableExists = tableCheckStmt.get();
        
        if (!tableExists) {
          // Create the table if it doesn't exist
          console.log('Creating preferences table...');
          const createTableStmt = rawDb.prepare(`
            CREATE TABLE IF NOT EXISTS preferences (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              theme TEXT DEFAULT 'dark',
              font_size TEXT DEFAULT 'medium',
              language TEXT DEFAULT 'english'
            )
          `);
          createTableStmt.run();
        }
      } catch (error) {
        console.log('Error checking table existence:', error);
      }
      
      const existingPrefs = await this.getPreferences();
      
      if (!existingPrefs) {
        // Create new preferences
        const theme = String(prefsUpdate.theme || 'dark');
        const fontSize = String(prefsUpdate.fontSize || 'medium');
        const language = String(prefsUpdate.language || 'english');
        
        console.log('Creating new preferences:', { theme, fontSize, language });
        
        const stmt = rawDb.prepare('INSERT INTO preferences (theme, font_size, language) VALUES (?, ?, ?)');
        const result = stmt.run(theme, fontSize, language);
        
        return { 
          id: Number(result.lastInsertRowid), 
          theme, 
          fontSize, 
          language 
        } as Preference;
      } else {
        // Update existing preferences
        const fields: string[] = [];
        const values: any[] = [];
        
        if (prefsUpdate.theme !== undefined) {
          fields.push('theme = ?');
          values.push(String(prefsUpdate.theme));
        }
        
        if (prefsUpdate.fontSize !== undefined) {
          fields.push('font_size = ?');
          values.push(String(prefsUpdate.fontSize));
        }
        
        if (prefsUpdate.language !== undefined) {
          fields.push('language = ?');
          values.push(String(prefsUpdate.language));
        }
        
        if (fields.length === 0) {
          return existingPrefs;
        }
        
        console.log('Updating preferences:', { fields, values, id: existingPrefs.id });
        
        values.push(Number(existingPrefs.id));
        const stmt = rawDb.prepare(
          `UPDATE preferences SET ${fields.join(', ')} WHERE id = ?`
        );
        stmt.run(...values);
        
        return this.getPreferences() as Promise<Preference>;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }
}

export const storage = new DatabaseStorage();