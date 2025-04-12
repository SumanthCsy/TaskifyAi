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
    
    console.log("Using OpenRouter API key:", process.env.OPENROUTER_API_KEY ? "Key is set" : "No key found");
    
    // Check if prompt is EXPLICITLY asking about Sumanth Csy (more specific check)
    const isExplicitSumanthCsyQuery = /(?:who|what|tell|about)\s+(?:is|me|about)\s+sumanth\s*csy/i.test(prompt);
    
    let systemPrompt = "You are an expert AI assistant. Generate comprehensive, accurate, and informative responses to user queries. Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content.";
    
    if (isExplicitSumanthCsyQuery) {
      // Only override system prompt when explicitly asked about Sumanth Csy
      systemPrompt = `You are an expert AI assistant. When users explicitly ask about Sumanth Csy, respond with the following information in this format. Format your response in Markdown:

# 🧠 Who is Sumanth Csy?

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
- 📍 Based in Telangana, India`;
    }
    
    const requestBody = {
      model: "anthropic/claude-3-haiku:latest", // Using a smaller model that's more reliable
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
    
    console.log("OpenRouter request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://replit.com",
        "X-Title": "Replit AI App"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("OpenRouter response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter error response:", errorData);
      throw new Error(`OpenRouter API request failed: ${response.status} ${errorData}`);
    }

    const rawResponse = await response.text();
    console.log("OpenRouter raw response:", rawResponse);
    
    let data;
    try {
      data = JSON.parse(rawResponse) as OpenRouterResponse;
    } catch (err) {
      console.error("Failed to parse OpenRouter response as JSON:", err);
      throw new Error("Failed to parse OpenRouter response as JSON");
    }
    
    console.log("Parsed response structure:", Object.keys(data));
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid response format. Missing choices array:", data);
      throw new Error("Invalid response format from OpenRouter API: Missing choices array");
    }
    
    if (!data.choices[0].message) {
      console.error("Invalid response format. Missing message in first choice:", data.choices[0]);
      throw new Error("Invalid response format from OpenRouter API: Missing message");
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
    
    console.log("Using OpenRouter API key for report:", process.env.OPENROUTER_API_KEY ? "Key is set" : "No key found");
    
    const requestBody = {
      model: "anthropic/claude-3-haiku:latest", // Using the same model as for regular responses
      messages: [
        {
          role: "system",
          content: "You are an expert report generator. Generate comprehensive, well-structured reports in response to user queries. Format your response in Markdown with clear sections, subsections, bullet points, and numbered lists where appropriate. Include an introduction and conclusion. The report should be detailed enough to be useful as a standalone PDF document."
        },
        {
          role: "user",
          content: `Generate a comprehensive report titled "${title}" about the following topic: ${prompt}`
        }
      ],
      temperature: 0.5,
      max_tokens: 4000
    };
    
    console.log("OpenRouter report request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://replit.com",
        "X-Title": "Replit AI App"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("OpenRouter report response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter report error response:", errorData);
      throw new Error(`OpenRouter API request failed: ${response.status} ${errorData}`);
    }

    const rawResponse = await response.text();
    console.log("OpenRouter report raw response:", rawResponse.substring(0, 200) + "...");
    
    let data;
    try {
      data = JSON.parse(rawResponse) as OpenRouterResponse;
    } catch (err) {
      console.error("Failed to parse OpenRouter report response as JSON:", err);
      throw new Error("Failed to parse OpenRouter report response as JSON");
    }
    
    console.log("Parsed report response structure:", Object.keys(data));
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid report response format. Missing choices array:", data);
      throw new Error("Invalid response format from OpenRouter API: Missing choices array");
    }
    
    if (!data.choices[0].message) {
      console.error("Invalid report response format. Missing message in first choice:", data.choices[0]);
      throw new Error("Invalid response format from OpenRouter API: Missing message");
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
    
    console.log("Using OpenRouter API key for suggested prompts:", process.env.OPENROUTER_API_KEY ? "Key is set" : "No key found");
    
    const requestBody = {
      model: "anthropic/claude-3-haiku:latest", // Using the same model as for regular responses
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Generate 10 interesting prompts that users might want to ask. These should be diverse across different domains like science, technology, health, business, arts, etc. Format them as a numbered list."
        },
        {
          role: "user",
          content: "Generate 10 interesting prompts for an AI information tool."
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    };
    
    console.log("OpenRouter suggested prompts request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://replit.com",
        "X-Title": "Replit AI App"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("OpenRouter suggested prompts response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter suggested prompts error response:", errorData);
      throw new Error(`OpenRouter API request failed: ${response.status} ${errorData}`);
    }

    const rawResponse = await response.text();
    console.log("OpenRouter suggested prompts raw response:", rawResponse.substring(0, 200) + "...");
    
    let data;
    try {
      data = JSON.parse(rawResponse) as OpenRouterResponse;
    } catch (err) {
      console.error("Failed to parse OpenRouter suggested prompts response as JSON:", err);
      throw new Error("Failed to parse OpenRouter suggested prompts response as JSON");
    }
    
    console.log("Parsed suggested prompts response structure:", Object.keys(data));
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid suggested prompts response format. Missing choices array:", data);
      throw new Error("Invalid response format from OpenRouter API: Missing choices array");
    }
    
    if (!data.choices[0].message) {
      console.error("Invalid suggested prompts response format. Missing message in first choice:", data.choices[0]);
      throw new Error("Invalid response format from OpenRouter API: Missing message");
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