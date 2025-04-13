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

interface CricketScore {
  match: string;
  teams: string[];
  scores: string[];
  status: string;
  matchType: string;
}

/**
 * Function to fetch real-time cricket scores from an API
 */
async function fetchCricketScores(): Promise<CricketScore[] | null> {
  try {
    // Using CricAPI to fetch live cricket scores
    const response = await fetch('https://cricapi.com/api/matches', {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.log("Failed to fetch cricket scores");
      return null;
    }
    
    const data = await response.json();
    if (!data.matches) {
      return null;
    }
    
    // Format the data
    return data.matches.slice(0, 5).map((match: any) => ({
      match: match.unique_id,
      teams: [match.team-1, match.team-2],
      scores: [match['score-1'] || 'N/A', match['score-2'] || 'N/A'],
      status: match.matchStatus,
      matchType: match.type
    }));
  } catch (error) {
    console.error("Error fetching cricket scores:", error);
    return null;
  }
}

/**
 * Fetch latest news or information about a topic
 */
async function fetchLatestInformation(topic: string): Promise<string | null> {
  try {
    // This is a simplified example - in a real implementation, you would use a proper news API
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&pageSize=3`);
    
    if (!response.ok) {
      console.log(`Failed to fetch information about ${topic}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.articles || data.articles.length === 0) {
      return null;
    }
    
    // Format the data
    return data.articles.map((article: any) => 
      `- **${article.title}** (${new Date(article.publishedAt).toLocaleDateString()}): ${article.description}`
    ).join('\n\n');
  } catch (error) {
    console.error(`Error fetching information about ${topic}:`, error);
    return null;
  }
}

/**
 * Detect what kind of real-time data might be needed based on the prompt
 */
async function detectAndFetchRealTimeData(prompt: string): Promise<string | null> {
  // Check if the prompt is asking about cricket scores or matches
  const cricketRegex = /cricket\s+(scores?|matches?|results?|updates?|status|live|current|today)/i;
  if (cricketRegex.test(prompt)) {
    const scores = await fetchCricketScores();
    if (scores) {
      let formattedScores = "## 🏏 Live Cricket Scores\n\n";
      formattedScores += "| Match | Teams | Scores | Status |\n";
      formattedScores += "|-------|-------|--------|--------|\n";
      
      scores.forEach(match => {
        formattedScores += `| ${match.matchType} | ${match.teams.join(' vs ')} | ${match.scores.join(' / ')} | ${match.status} |\n`;
      });
      
      formattedScores += "\n*Data updated as of " + new Date().toLocaleString() + "*\n\n";
      return formattedScores;
    }
  }
  
  // Check if the prompt is asking for latest news or information
  const newsRegex = /(latest|recent|current|today'?s?)\s+(news|updates|information|developments|events|happenings)\s+(about|on|regarding)\s+([a-z0-9\s]+)/i;
  const newsMatch = prompt.match(newsRegex);
  if (newsMatch && newsMatch[4]) {
    const topic = newsMatch[4].trim();
    const latestInfo = await fetchLatestInformation(topic);
    if (latestInfo) {
      return `## 📰 Latest Updates on ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\n${latestInfo}\n\n*Information retrieved as of ${new Date().toLocaleString()}*\n\n`;
    }
  }
  
  return null;
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
    
    // Check if prompt is EXPLICITLY asking about Sumanth Csy (more specific and strict check)
    const isExplicitSumanthCsyQuery = /(?:who|what|tell|about|is)\s+(?:is|about|info|information|on)\s+sumanth\s*csy|(?:who|who's)\s+(?:is|made|created|developed|built)\s+(?:this|taskify)|who's\s+the\s+(?:creator|founder|developer|maker)|tell\s+(?:me|us)\s+about\s+(?:the\s+creator|the\s+founder|sumanth|the\s+developer)/i.test(prompt);
    
    // Check if prompt is asking about Taskify AI (more specific check)
    const isTaskifyAiQuery = /(?:what|tell|about|is)\s+(?:is|about|info|information|on)\s+(?:taskify|this\s+app|the\s+app|this\s+platform|the\s+platform)|what\s+can\s+taskify\s+do|how\s+does\s+taskify\s+work|features\s+of\s+taskify/i.test(prompt);
    
    // Detect if the prompt is asking for code
    const isCodeQuery = /(?:write|generate|create|show|give|provide)\s+(?:me|us|a|an|the|some)?\s+(?:code|script|program|function|method|class|implementation|algorithm)\s+(?:for|to|that|which|in|using|with)/i.test(prompt);
    
    // Default system prompt
    let systemPrompt = "You are an expert AI assistant. Generate comprehensive, accurate, and informative responses to user queries. Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content. Do not include any information about Sumanth Csy or Taskify AI unless specifically asked.";
    
    // Add code formatting instructions if it's a code query
    if (isCodeQuery) {
      systemPrompt += "\n\nWhen providing code examples:\n1. Always use proper syntax highlighting with markdown triple backticks and language name (e.g. ```python, ```javascript)\n2. Include detailed comments explaining the code\n3. Structure the code with proper indentation and formatting\n4. Follow best practices for the specific programming language\n5. Provide clear explanations before and after the code blocks";
    }
    
    // Add table formatting instructions for data presentation
    systemPrompt += "\n\nWhen presenting data or comparisons:\n1. Use markdown tables with clear headers and aligned columns\n2. For numerical comparisons, consider using visual indicators (like ✅, ⚠️, ❌) when appropriate\n3. Structure complex information in a hierarchical manner\n4. Include summaries or key takeaways after tables\n5. Ensure all data is well-organized and easy to understand";
    
    if (isTaskifyAiQuery) {
      // Override system prompt when explicitly asked about Taskify AI
      systemPrompt = `You are an expert AI assistant that provides only the following information about Taskify AI when users ask about it, the app, or the platform. Format your response in Markdown:

# 🚀 Taskify AI: Your All-in-One Productivity Companion

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
- **🔄 Versatility**: Address multiple content needs in one platform
`;
    } else if (isExplicitSumanthCsyQuery) {
      // Only override system prompt when explicitly asked about Sumanth Csy
      systemPrompt = `You are an expert AI assistant that provides only the following information about Sumanth Csy when users ask about him, the founder, or the creator. Format your response in Markdown:

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
    
    let content = data.choices[0].message.content;

    // Try to fetch real-time data based on the prompt
    try {
      const realTimeData = await detectAndFetchRealTimeData(prompt);
      if (realTimeData) {
        // Insert the real-time data at the beginning of the content, after the title
        const contentLines = content.split('\n');
        let titleLine = 0;
        
        // Find the title line
        for (let i = 0; i < contentLines.length; i++) {
          if (contentLines[i].startsWith('# ')) {
            titleLine = i;
            break;
          }
        }
        
        // Insert real-time data after the title
        contentLines.splice(titleLine + 1, 0, '\n' + realTimeData);
        content = contentLines.join('\n');
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      // Continue without real-time data if there's an error
    }

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
    
    // Detect if the prompt is asking for code
    const isCodeReport = /(?:code|programming|development|software|app|application|website|web|mobile|script|function|algorithm)/i.test(prompt);
    
    // Define system prompt based on report type
    let systemPrompt = "You are an expert report generator. Generate comprehensive, well-structured reports in response to user queries. Format your response in Markdown with clear sections, subsections, bullet points, and numbered lists where appropriate. Include an introduction and conclusion. The report should be detailed enough to be useful as a standalone PDF document.";
    
    // Add code formatting instructions if it's a code-related report
    if (isCodeReport) {
      systemPrompt += "\n\nWhen providing code examples:\n1. Always use proper syntax highlighting with markdown triple backticks and language name (e.g. ```python, ```javascript)\n2. Include detailed comments explaining the code\n3. Structure the code with proper indentation and formatting\n4. Follow best practices for the specific programming language\n5. Provide clear explanations before and after the code blocks";
    }
    
    // Add table formatting instructions for data presentation
    systemPrompt += "\n\nFor data presentation:\n1. Use markdown tables with clear headers and aligned columns\n2. For numerical comparisons, use visual indicators (like ✅, ⚠️, ❌) when appropriate\n3. Structure complex information in a hierarchical manner\n4. Include summaries or key takeaways after tables\n5. Ensure all data is well-organized and visually appealing\n6. Use emojis as bullet points where appropriate to make key sections stand out";
    
    const requestBody = {
      model: "anthropic/claude-3-haiku:latest", // Using the same model as for regular responses
      messages: [
        {
          role: "system",
          content: systemPrompt
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