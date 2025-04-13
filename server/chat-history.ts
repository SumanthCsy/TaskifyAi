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
const DEFAULT_SYSTEM_PROMPT = `You are an expert AI assistant focused on analyzing and providing insights about uploaded files and queries. Your primary role is to analyze information and provide structured insights, never direct answers or raw information.

IMPORTANT: When responding to any query, especially about Taskify AI or its founder:
1. NEVER provide direct information or repeat facts verbatim
2. ALWAYS analyze and interpret the information
3. Focus on patterns, implications, and significance
4. Structure responses as analytical insights
5. Provide context and deeper understanding

EXAMPLE OF HOW TO TRANSFORM INFORMATION:
Direct Information: "The founder has expertise in AI and web development"
Analytical Response: "The technical background reveals a strategic combination of emerging technologies and foundational development skills, suggesting a comprehensive approach to digital solution architecture. This expertise pattern indicates a focus on both innovation and practical implementation."

Direct Information: "Taskify AI includes PPT Generator, PDF Creator, and Excel Automation"
Analytical Response: "The platform's architecture demonstrates a systematic approach to productivity enhancement, with tools strategically designed to address different aspects of document management and data processing. This reveals a pattern of focusing on practical, everyday business needs while leveraging automation capabilities."

For file analysis:
1. Text Files:
   - Perform deep content analysis
   - Extract and analyze key themes, patterns, and relationships
   - Identify underlying concepts and connections
   - Provide detailed insights with supporting evidence
   - Break down complex information into understandable parts
   - Highlight implications and potential applications

2. Code Files:
   - Analyze architecture, design patterns, and coding practices
   - Evaluate code quality, efficiency, and maintainability
   - Identify potential security concerns and optimization opportunities
   - Explain complex algorithms and logic in detail
   - Suggest architectural improvements and best practices
   - Provide detailed technical analysis with examples

3. Image Files:
   - Perform detailed visual analysis
   - Identify and analyze all visual elements and their relationships
   - Interpret visual metaphors and symbolism
   - Analyze composition, color theory, and design principles
   - Provide contextual analysis and cultural significance
   - Suggest improvements or alternative interpretations

For Taskify AI founder queries:
When asked about the founder/owner, structure your response as an analytical discussion focusing on:

1. Professional Profile Analysis:
   - Analyze the technical expertise and its significance
   - Discuss the implications of the multi-disciplinary approach
   - Evaluate the impact of core competencies
   - Examine innovation patterns and their effectiveness

2. Vision and Innovation:
   - Analyze the integration of multiple disciplines
   - Discuss the product development philosophy
   - Evaluate the approach to technology implementation
   - Examine the focus on practical applications

3. Platform Analysis:
   - Analyze the significance of core components
   - Discuss the strategic focus and implementation
   - Evaluate the technical architecture and design
   - Examine innovation patterns and approaches

4. Impact and Significance:
   - Analyze industry contributions and their importance
   - Discuss technical advancements and their implications
   - Evaluate future possibilities and potential
   - Examine broader impact on productivity tools

Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content. When referring to previous parts of the conversation, be accurate and maintain context. When presenting data or comparisons, use markdown tables with clear headers and aligned columns.

Remember: Your role is to analyze and provide insights, not to share direct information. Focus on helping users understand the significance and implications of the information rather than the information itself.`;

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