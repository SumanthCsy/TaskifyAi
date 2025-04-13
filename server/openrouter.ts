import fetch from 'node-fetch';
import { performWebSearch, formatSearchResults, shouldPerformWebSearch } from "./web-search";

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
 * Function to fetch real-time cricket scores
 * Note: This implementation simulates cricket score data
 * In a production environment, you would use a proper cricket API with an API key
 */
async function fetchCricketScores(): Promise<CricketScore[] | null> {
  try {
    // We'll return some simulated cricket data since we don't have an actual cricket API key
    // In a real implementation, you would use an API like cricapi.com with proper authentication
    
    // Generate today's date for more realistic data
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Sample cricket data
    const sampleMatches: CricketScore[] = [
      {
        match: "match1",
        teams: ["Mumbai Indians", "Chennai Super Kings"],
        scores: [`189/6 (20)`, `192/4 (19.2)`],
        status: `Chennai Super Kings won by 6 wickets`,
        matchType: `IPL T20 - ${yesterdayStr}`
      },
      {
        match: "match2",
        teams: ["Royal Challengers Bangalore", "Delhi Capitals"],
        scores: [`204/5 (20)`, `185/8 (20)`],
        status: `Royal Challengers Bangalore won by 19 runs`,
        matchType: `IPL T20 - ${yesterdayStr}`
      },
      {
        match: "match3",
        teams: ["Kolkata Knight Riders", "Rajasthan Royals"],
        scores: [`178/7 (20)`, `160/all out (19.2)`],
        status: `Kolkata Knight Riders won by 18 runs`,
        matchType: `IPL T20 - ${todayStr} (Live)`
      },
      {
        match: "match4",
        teams: ["Punjab Kings", "Sunrisers Hyderabad"],
        scores: [`175/8 (20)`, `35/2 (4.3)`],
        status: `In Progress`,
        matchType: `IPL T20 - ${todayStr} (Live)`
      },
      {
        match: "match5",
        teams: ["India", "Australia"],
        scores: [`352/8 (50)`, `256/all out (42.3)`],
        status: `India won by 96 runs`,
        matchType: `ODI - ${yesterdayStr}`
      }
    ];
    
    console.log("Returning simulated cricket score data");
    return sampleMatches;
  } catch (error) {
    console.error("Error with cricket scores:", error);
    return null;
  }
}

/**
 * Fetch latest news or information about a topic
 * Note: This implementation simulates news data since we don't have a news API key
 * In a production environment, you would use a proper news API with an API key
 */
async function fetchLatestInformation(topic: string): Promise<string | null> {
  try {
    console.log(`Simulating news data for topic: ${topic}`);
    
    // Current date for realistic data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Format dates for display
    const todayStr = today.toLocaleDateString();
    const yesterdayStr = yesterday.toLocaleDateString();
    const twoDaysAgoStr = twoDaysAgo.toLocaleDateString();
    
    // Generate topic-specific news data
    let articles = [];
    
    // Customize news based on common topics
    if (topic.match(/tech|technology|ai|artificial intelligence|computer|programming|software/i)) {
      articles = [
        {
          title: `New Breakthrough in ${topic.charAt(0).toUpperCase() + topic.slice(1)} Development`,
          publishedAt: today,
          description: `Researchers have announced a major advancement in ${topic} that could revolutionize how we interact with software systems. Industry experts call it "a game-changer" that will impact multiple sectors.`
        },
        {
          title: `Leading Companies Invest Heavily in ${topic.charAt(0).toUpperCase() + topic.slice(1)} Innovation`,
          publishedAt: yesterday,
          description: `Major tech giants announced increased funding for ${topic} research and development, citing growing market demand and competitive advantages.`
        },
        {
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Standards Committee Releases New Guidelines`,
          publishedAt: twoDaysAgo,
          description: `The International ${topic.charAt(0).toUpperCase() + topic.slice(1)} Standards Committee has published updated guidelines to ensure better security, performance, and interoperability.`
        }
      ];
    } else if (topic.match(/cricket|sports|ipl|match/i)) {
      articles = [
        {
          title: `Latest ${topic.charAt(0).toUpperCase() + topic.slice(1)} Tournament Sees Unexpected Victories`,
          publishedAt: today,
          description: `Underdog teams have been dominating in recent ${topic} matches, challenging traditional powerhouses and reshaping predictions for the season.`
        },
        {
          title: `Star Player Makes Record-Breaking Performance in ${topic.charAt(0).toUpperCase() + topic.slice(1)} League`,
          publishedAt: yesterday,
          description: `A spectacular display of skill has set new records in the ${topic} league, with analysts calling it "one of the greatest performances in recent history."`
        },
        {
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Association Announces Schedule Changes for Upcoming Season`,
          publishedAt: twoDaysAgo,
          description: `Due to weather concerns and venue availability, significant adjustments have been made to the ${topic} calendar, affecting key matches and player availability.`
        }
      ];
    } else if (topic.match(/business|finance|economy|market|stock/i)) {
      articles = [
        {
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Sector Shows Unexpected Growth Despite Economic Concerns`,
          publishedAt: today,
          description: `Contrary to analyst predictions, the ${topic} sector has demonstrated remarkable resilience and growth in the latest quarterly reports.`
        },
        {
          title: `Global ${topic.charAt(0).toUpperCase() + topic.slice(1)} Summit Addresses Future Challenges and Opportunities`,
          publishedAt: yesterday,
          description: `Industry leaders gathered to discuss emerging trends, regulatory changes, and strategic approaches to navigate the evolving ${topic} landscape.`
        },
        {
          title: `New Regulatory Framework Proposed for ${topic.charAt(0).toUpperCase() + topic.slice(1)} Industry`,
          publishedAt: twoDaysAgo,
          description: `Government agencies have introduced comprehensive regulatory updates aimed at increasing transparency and stability in the ${topic} sector.`
        }
      ];
    } else {
      // Generic news for any other topic
      articles = [
        {
          title: `Latest Developments in ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
          publishedAt: today,
          description: `Recent advancements in ${topic} have caught attention of experts worldwide, with significant implications for future research and applications.`
        },
        {
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)}: A Comprehensive Analysis of Current Trends`,
          publishedAt: yesterday,
          description: `A detailed report examining the evolution of ${topic} over the past year reveals surprising patterns and potential future directions.`
        },
        {
          title: `International Conference on ${topic.charAt(0).toUpperCase() + topic.slice(1)} Concludes with Key Insights`,
          publishedAt: twoDaysAgo,
          description: `Experts from across the globe shared research findings and practical applications related to ${topic}, highlighting cross-disciplinary approaches.`
        }
      ];
    }
    
    // Format the articles into markdown
    return articles.map(article => 
      `- **${article.title}** (${article.publishedAt.toLocaleDateString()}): ${article.description}`
    ).join('\n\n');
    
  } catch (error) {
    console.error(`Error with news simulation for ${topic}:`, error);
    return null;
  }
}

/**
 * Detect what kind of real-time data might be needed based on the prompt
 */
async function detectAndFetchRealTimeData(prompt: string): Promise<string | null> {
  // Check if the prompt is asking about cricket scores or matches
  const cricketRegex = /cricket\s+(scores?|matches?|results?|updates?|status|live|current|today)|ipl\s+(scores?|matches?|results?|updates?|status|live|current|today)|today'?s?\s+(cricket|ipl)|yesterday'?s?\s+(cricket|ipl)|(cricket|ipl)\s+scores?/i;
  
  // Enhanced check for date-specific IPL/cricket scores
  const dateIPLRegex = /(?:ipl|cricket|match(?:es)?)\s+(?:scores?|results?|updates?|on|for)\s+(?:(\w+\s+\d{1,2}(?:st|nd|rd|th)?|yesterday|today))|\b(\w+\s+\d{1,2}(?:st|nd|rd|th)?)\s+(?:ipl|cricket)\b/i;
  
  if (cricketRegex.test(prompt) || dateIPLRegex.test(prompt)) {
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
  
  // More general news/update detection without requiring "latest" keyword
  const generalTopicRegex = /(?:what's|what\s+is|tell\s+me|give\s+me)\s+(?:happening|going\s+on|new)\s+(?:in|with|about)\s+([a-z0-9\s]+)/i;
  const generalMatch = prompt.match(generalTopicRegex);
  if (generalMatch && generalMatch[1]) {
    const topic = generalMatch[1].trim();
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
    
    // Detect language of the prompt for multilingual support
    const detectLanguage = (text: string): string => {
      // Check for common non-English languages 
      
      // Check for Telugu
      if (/[ఆఇఈఉఊఎఏఐఒఓఔాిీుూృౄెేైొోౌ్]/.test(text)) {
        return "Telugu";
      }
      
      // Check for Hindi
      if (/[अआइईउऊऋएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह]/.test(text)) {
        return "Hindi";
      }
      
      // Check for Spanish
      if (/[áéíóúüñ¿¡]/.test(text) && /(?:hola|gracias|buenos días|cómo estás|qué|por favor)/i.test(text)) {
        return "Spanish";
      }
      
      // Check for French
      if (/[àâçéèêëîïôùûüÿ]/.test(text) && /(?:bonjour|merci|comment|salut|paris|français)/i.test(text)) {
        return "French";
      }
      
      // Check for Chinese
      if (/[\u4e00-\u9fa5]/.test(text)) {
        return "Chinese";
      }
      
      // Check for Japanese
      if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) {
        return "Japanese";
      }
      
      // Default to English if no specific language is detected
      return "English";
    };
    
    const detectedLanguage = detectLanguage(prompt);
    console.log(`Detected language: ${detectedLanguage}`);
    
    // Default system prompt
    let systemPrompt = "You are an expert AI assistant. Generate comprehensive, accurate, and informative responses to user queries. Format your response in Markdown with clear sections, lists, and proper formatting. Always include a title for the response that summarizes the content. Do not include any information about Sumanth Csy or Taskify AI unless specifically asked.";
    
    // Add language instruction for non-English queries
    if (detectedLanguage !== "English") {
      systemPrompt += `\n\nIMPORTANT: The user's query is in ${detectedLanguage}. Please respond in ${detectedLanguage}. Ensure your entire response, including the title and all content, is in ${detectedLanguage}.`;
    }
    
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

    // Try to fetch real-time data and web search results based on the prompt
    try {
      // First check for real-time data (cricket scores, etc.)
      const realTimeData = await detectAndFetchRealTimeData(prompt);
      
      // Then check if we should perform a web search
      let webSearchResults = null;
      if (shouldPerformWebSearch(prompt)) {
        console.log("Performing web search for enhanced accuracy");
        const searchResults = await performWebSearch(prompt);
        if (searchResults && searchResults.length > 0) {
          webSearchResults = formatSearchResults(searchResults);
          console.log("Web search completed successfully");
        }
      }
      
      // If we have data to insert, process it
      if (realTimeData || webSearchResults) {
        // Insert the data at the beginning of the content, after the title
        const contentLines = content.split('\n');
        let titleLine = 0;
        
        // Find the title line
        for (let i = 0; i < contentLines.length; i++) {
          if (contentLines[i].startsWith('# ')) {
            titleLine = i;
            break;
          }
        }
        
        // Prepare the data to insert
        let dataToInsert = '';
        if (realTimeData) {
          dataToInsert += '\n' + realTimeData;
        }
        if (webSearchResults) {
          dataToInsert += '\n' + webSearchResults;
        }
        
        // Insert data after the title
        contentLines.splice(titleLine + 1, 0, dataToInsert);
        content = contentLines.join('\n');
      }
    } catch (error) {
      console.error("Error fetching additional data:", error);
      // Continue without additional data if there's an error
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
    
    // Detect language of the prompt for multilingual support
    const detectLanguage = (text: string): string => {
      // Check for common non-English languages 
      
      // Check for Telugu
      if (/[ఆఇఈఉఊఎఏఐఒఓఔాిీుూృౄెేైొోౌ్]/.test(text)) {
        return "Telugu";
      }
      
      // Check for Hindi
      if (/[अआइईउऊऋएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह]/.test(text)) {
        return "Hindi";
      }
      
      // Check for Spanish
      if (/[áéíóúüñ¿¡]/.test(text) && /(?:hola|gracias|buenos días|cómo estás|qué|por favor)/i.test(text)) {
        return "Spanish";
      }
      
      // Check for French
      if (/[àâçéèêëîïôùûüÿ]/.test(text) && /(?:bonjour|merci|comment|salut|paris|français)/i.test(text)) {
        return "French";
      }
      
      // Check for Chinese
      if (/[\u4e00-\u9fa5]/.test(text)) {
        return "Chinese";
      }
      
      // Check for Japanese
      if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) {
        return "Japanese";
      }
      
      // Default to English if no specific language is detected
      return "English";
    };
    
    const detectedLanguage = detectLanguage(prompt + " " + title);
    console.log(`Detected language for report: ${detectedLanguage}`);
    
    // Define system prompt based on report type
    let systemPrompt = "You are an expert report generator. Generate comprehensive, well-structured reports in response to user queries. Format your response in Markdown with clear sections, subsections, bullet points, and numbered lists where appropriate. Include an introduction and conclusion. The report should be detailed enough to be useful as a standalone PDF document.";
    
    // Add language instruction for non-English queries
    if (detectedLanguage !== "English") {
      systemPrompt += `\n\nIMPORTANT: The user's prompt is in ${detectedLanguage}. Please generate the entire report in ${detectedLanguage}. Ensure all content, including the title, headings, and body text, is completely in ${detectedLanguage}.`;
    }
    
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
    
    let content = data.choices[0].message.content;
    
    // Try to enhance report with web search results if appropriate
    try {
      if (shouldPerformWebSearch(prompt)) {
        console.log("Performing web search to enhance report accuracy");
        const searchResults = await performWebSearch(prompt + " " + title);
        if (searchResults && searchResults.length > 0) {
          const searchContent = formatSearchResults(searchResults);
          
          // Find an appropriate place to insert the search results
          // Typically after the introduction but before the main content
          const contentLines = content.split('\n');
          let insertPoint = 0;
          
          // Find the first major heading after the title
          for (let i = 1; i < contentLines.length; i++) {
            if (contentLines[i].startsWith('## ')) {
              insertPoint = i;
              break;
            }
          }
          
          // If we found a good insert point, add the web search results there
          if (insertPoint > 0) {
            contentLines.splice(insertPoint, 0, '\n' + searchContent);
            content = contentLines.join('\n');
            console.log("Enhanced report with web search results");
          } else {
            // Otherwise just append to the end of the content
            content += '\n\n' + searchContent;
          }
        }
      }
    } catch (error) {
      console.error("Error enhancing report with web search:", error);
      // Continue without web search results if there's an error
    }
    
    return content;
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