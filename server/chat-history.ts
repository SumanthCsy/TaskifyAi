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

// Store active chat sessions in memory
// In a production environment, this would be stored in a database
const activeSessions: Map<string, ChatSession> = new Map();

// Maximum number of messages to keep in history (to prevent token limits)
const MAX_HISTORY_LENGTH = 10;

// Default session expiration time (30 minutes)
const SESSION_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Create a new chat session or retrieve an existing one
 */
export function getOrCreateSession(sessionId: string): ChatSession {
  // Clean expired sessions periodically
  cleanExpiredSessions();
  
  if (!activeSessions.has(sessionId)) {
    // Create new session
    activeSessions.set(sessionId, {
      id: sessionId,
      messages: [
        {
          role: 'system',
          content: "You are an expert AI assistant. Generate comprehensive, accurate, and informative responses to user queries. Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content. Do not include any information about Sumanth Csy or Taskify AI unless specifically asked. When referring to previous parts of the conversation, be accurate and maintain context. When presenting data or comparisons, use markdown tables with clear headers and aligned columns."
        }
      ],
      lastUpdated: new Date()
    });
    console.log(`New chat session created: ${sessionId}`);
  } else {
    // Update last activity time for existing session
    const session = activeSessions.get(sessionId)!;
    session.lastUpdated = new Date();
    activeSessions.set(sessionId, session);
  }
  
  return activeSessions.get(sessionId)!;
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
  
  // Keep history within limits
  if (session.messages.length > MAX_HISTORY_LENGTH + 1) { // +1 for system message
    // Always keep the system message (first message)
    const systemMessage = session.messages[0];
    // Keep the most recent messages
    session.messages = [
      systemMessage,
      ...session.messages.slice(session.messages.length - MAX_HISTORY_LENGTH)
    ];
  }
  
  activeSessions.set(sessionId, session);
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
  
  // Keep history within limits
  if (session.messages.length > MAX_HISTORY_LENGTH + 1) { // +1 for system message
    // Always keep the system message (first message)
    const systemMessage = session.messages[0];
    // Keep the most recent messages
    session.messages = [
      systemMessage,
      ...session.messages.slice(session.messages.length - MAX_HISTORY_LENGTH)
    ];
  }
  
  activeSessions.set(sessionId, session);
}

/**
 * Get all messages for a specific chat session
 */
export function getSessionMessages(sessionId: string): ChatMessage[] {
  const session = getOrCreateSession(sessionId);
  return [...session.messages]; // Return a copy to prevent external modification
}

/**
 * Clear chat history for a specific session
 */
export function clearSessionHistory(sessionId: string): void {
  if (activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId)!;
    // Keep only the system message
    const systemMessage = session.messages[0];
    session.messages = [systemMessage];
    activeSessions.set(sessionId, session);
    console.log(`Chat history cleared for session: ${sessionId}`);
  }
}

/**
 * Clean up expired sessions to prevent memory leaks
 */
function cleanExpiredSessions(): void {
  const now = new Date();
  
  // Use forEach instead of for...of to avoid iterator issues with Map
  activeSessions.forEach((session, sessionId) => {
    const elapsed = now.getTime() - session.lastUpdated.getTime();
    if (elapsed > SESSION_EXPIRATION_MS) {
      activeSessions.delete(sessionId);
      console.log(`Expired chat session removed: ${sessionId}`);
    }
  });
}

/**
 * Update the system prompt for a specific session
 */
export function updateSystemPrompt(sessionId: string, systemPrompt: string): void {
  const session = getOrCreateSession(sessionId);
  
  // Replace the first message (system prompt)
  if (session.messages.length > 0 && session.messages[0].role === 'system') {
    session.messages[0].content = systemPrompt;
  } else {
    // Insert system prompt at the beginning if not present
    session.messages.unshift({
      role: 'system',
      content: systemPrompt
    });
  }
  
  activeSessions.set(sessionId, session);
}

/**
 * Delete a session completely
 */
export function deleteSession(sessionId: string): boolean {
  if (activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    console.log(`Chat session deleted: ${sessionId}`);
    return true;
  }
  return false;
}