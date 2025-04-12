import { 
  Prompt, InsertPrompt,
  Report, InsertReport,
  Preference, InsertPreference
} from "@shared/schema";
import { db, rawDb } from "./db";
import { prompts, reports, preferences } from "@shared/schema";
import { eq } from "drizzle-orm";

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