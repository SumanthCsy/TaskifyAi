/**
 * Chat history management for maintaining conversation context
 * This module provides functionality to store and retrieve chat history
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

// In-memory storage for chat sessions
const sessions = new Map<string, ChatSession>();

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = "You are an expert AI assistant. Generate comprehensive, accurate, and informative responses to user queries. Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content. Do not include any information about Sumanth Csy or Taskify AI unless specifically asked. When referring to previous parts of the conversation, be accurate and maintain context. When presenting data or comparisons, use markdown tables with clear headers and aligned columns.";

// Session expiration time in milliseconds (24 hours)
const SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Create a new chat session or retrieve an existing one
 */
export function getOrCreateSession(sessionId: string): ChatSession {
  // Clean up expired sessions to prevent memory leaks
  cleanExpiredSessions();
  
  if (!sessions.has(sessionId)) {
    console.log(`New chat session created: ${sessionId}`);
    
    sessions.set(sessionId, {
      id: sessionId,
      messages: [
        {
          role: 'system',
          content: DEFAULT_SYSTEM_PROMPT
        }
      ],
      lastUpdated: new Date()
    });
  } else {
    // Update the last updated timestamp
    const session = sessions.get(sessionId)!;
    session.lastUpdated = new Date();
    sessions.set(sessionId, session);
  }
  
  return sessions.get(sessionId)!;
}

/**
 * Add a user message to the chat history
 */
export function addUserMessage(sessionId: string, content: string): void {
  const session = getOrCreateSession(sessionId);
  
  session.messages.push({
    role: 'user',
    content
  });
  
  session.lastUpdated = new Date();
  sessions.set(sessionId, session);
}

/**
 * Add an assistant (AI) response to the chat history
 */
export function addAssistantMessage(sessionId: string, content: string): void {
  const session = getOrCreateSession(sessionId);
  
  session.messages.push({
    role: 'assistant',
    content
  });
  
  session.lastUpdated = new Date();
  sessions.set(sessionId, session);
}

/**
 * Get all messages for a specific chat session
 */
export function getSessionMessages(sessionId: string): ChatMessage[] {
  const session = getOrCreateSession(sessionId);
  return [...session.messages]; // Return a copy to prevent modification
}

/**
 * Clear chat history for a specific session
 */
export function clearSessionHistory(sessionId: string): void {
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    
    // Keep only the system message
    session.messages = session.messages.filter(msg => msg.role === 'system');
    
    if (session.messages.length === 0) {
      // Add default system prompt if no system message exists
      session.messages.push({
        role: 'system',
        content: DEFAULT_SYSTEM_PROMPT
      });
    }
    
    session.lastUpdated = new Date();
    sessions.set(sessionId, session);
  }
}

/**
 * Clean up expired sessions to prevent memory leaks
 */
function cleanExpiredSessions(): void {
  const now = new Date();
  
  for (const entry of Array.from(sessions.entries())) {
    const [sessionId, session] = entry;
    const sessionAge = now.getTime() - session.lastUpdated.getTime();
    
    if (sessionAge > SESSION_EXPIRATION_MS) {
      console.log(`Removing expired session: ${sessionId}`);
      sessions.delete(sessionId);
    }
  }
}

/**
 * Update the system prompt for a specific session
 */
export function updateSystemPrompt(sessionId: string, systemPrompt: string): void {
  const session = getOrCreateSession(sessionId);
  
  // Find and update existing system message or add new one
  const systemMessageIndex = session.messages.findIndex(msg => msg.role === 'system');
  
  if (systemMessageIndex >= 0) {
    session.messages[systemMessageIndex].content = systemPrompt;
  } else {
    session.messages.unshift({
      role: 'system',
      content: systemPrompt
    });
  }
  
  session.lastUpdated = new Date();
  sessions.set(sessionId, session);
}

/**
 * Delete a session completely
 */
export function deleteSession(sessionId: string): boolean {
  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    return true;
  }
  return false;
}

// Get all sessions (for debugging or admin purposes)
export function getAllSessions(): { id: string, messageCount: number, lastUpdated: Date }[] {
  return Array.from(sessions.entries()).map(([id, session]) => ({
    id,
    messageCount: session.messages.length,
    lastUpdated: session.lastUpdated
  }));
}