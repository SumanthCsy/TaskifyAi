import fetch from 'node-fetch';

interface AiResponse {
  title: string;
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * API client for OpenRouter to generate text responses
 */
export async function generateAiResponse(prompt: string): Promise<AiResponse> {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not set");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://taskify-ai.replit.app", // In production, replace with your actual domain
        "X-Title": "Taskify AI"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus:beta", // Using Claude-3 Opus, can be changed to other models
        messages: [
          {
            role: "system",
            content: "You are an expert AI assistant for Taskify AI. Generate comprehensive, accurate, and informative responses to user queries. Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter API");
    }
    
    const content = data.choices[0].message.content;

    // Extract title from markdown (assuming first line is a markdown heading)
    let title = "AI-Generated Response";
    const contentLines = content.split('\n');
    
    for (const line of contentLines) {
      if (line.startsWith('# ')) {
        title = line.substring(2).trim();
        break;
      }
    }

    return {
      title,
      content
    };
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

/**
 * Generates a comprehensive report based on user prompt
 */
export async function generateReportContent(prompt: string, title: string): Promise<string> {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not set");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://taskify-ai.replit.app", // In production, replace with your actual domain
        "X-Title": "Taskify AI"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus:beta", // Using Claude-3 Opus for detailed reports
        messages: [
          {
            role: "system",
            content: "You are an expert report generator for Taskify AI. Generate comprehensive, well-structured reports in response to user queries. Format your response in Markdown with clear sections, subsections, bullet points, and numbered lists where appropriate. Include an introduction and conclusion. The report should be detailed enough to be useful as a standalone PDF document."
          },
          {
            role: "user",
            content: `Generate a comprehensive report titled "${title}" about the following topic: ${prompt}`
          }
        ],
        temperature: 0.5,
        max_tokens: 6000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter API");
    }
    
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error generating report content:", error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

/**
 * Generates suggested prompts for the home page
 */
export async function getSuggestedPrompts(): Promise<string[]> {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not set");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://taskify-ai.replit.app", // In production, replace with your actual domain
        "X-Title": "Taskify AI"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku:beta", // Using a smaller model for this simpler task
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for Taskify AI. Generate 10 interesting prompts that users might want to ask. These should be diverse across different domains like science, technology, health, business, arts, etc. Format them as a numbered list."
          },
          {
            role: "user",
            content: "Generate 10 interesting prompts for an AI information tool."
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter API");
    }
    
    const content = data.choices[0].message.content;
    
    // Parse the numbered list into an array of prompts
    const promptRegex = /\d+\.\s*(?:"|")(.*?)(?:"|")/g;
    const matches = content.matchAll(promptRegex);
    const prompts = Array.from(matches).map((match) => match[1] as string);
    
    // Ensure we have at least some prompts even if regex parsing fails
    if (prompts.length === 0) {
      const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
      return lines.slice(0, 10).map((line: string) => {
        // Remove potential numbering
        return line.replace(/^\d+\.\s*/, '').trim();
      });
    }
    
    return prompts;
  } catch (error: any) {
    console.error("Error generating suggested prompts:", error);
    // Return some default prompts if the API call fails
    return [
      "What are the latest advances in renewable energy?",
      "How can I improve my public speaking skills?",
      "Explain quantum computing in simple terms",
      "What are the best practices for remote team management?",
      "How does artificial intelligence impact healthcare?",
      "What are some effective study techniques?",
      "Explain how blockchain technology works",
      "What are the benefits of meditation?",
      "How can businesses reduce their carbon footprint?",
      "What are the key principles of effective leadership?"
    ];
  }
}