import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });

interface TopicContent {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  sections: {
    title: string;
    content: string;
  }[];
  relatedTopics: string[];
}

export async function generateTopicContent(query: string): Promise<TopicContent> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI information assistant. Generate comprehensive, accurate, and well-structured information about the requested topic. Format the response as JSON with the following structure: { title, description, content, category, tags, sections: [{ title, content }], relatedTopics }. Make the content educational, detailed and informative."
        },
        {
          role: "user",
          content: `Generate detailed information about: ${query}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || query,
      description: result.description || "",
      content: result.content || "",
      category: result.category || "General",
      tags: result.tags || [],
      sections: result.sections || [],
      relatedTopics: result.relatedTopics || []
    };
  } catch (error: any) {
    console.error("Error generating topic content:", error.message);
    throw new Error(`Failed to generate topic content: ${error.message}`);
  }
}

export async function generateReportContent(topicData: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a report generation assistant. Create a well-formatted, comprehensive PDF report about the provided topic. The report should be structured with sections, bullet points where appropriate, and should be informative and educational. Format the response as a string of well-formatted markdown that can be converted to PDF."
        },
        {
          role: "user",
          content: `Generate a detailed report about: ${JSON.stringify(topicData)}`
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error generating report content:", error.message);
    throw new Error(`Failed to generate report content: ${error.message}`);
  }
}

export async function getSuggestedTopics(): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a topic suggestion assistant. Generate 6 interesting and diverse topic suggestions that users might want to learn about. These should be specific enough to generate detailed content about. Respond with JSON in this format: { 'topics': [array of topic strings] }"
        },
        {
          role: "user",
          content: "Generate topic suggestions"
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.topics || [];
  } catch (error: any) {
    console.error("Error generating topic suggestions:", error.message);
    throw new Error(`Failed to generate topic suggestions: ${error.message}`);
  }
}

export async function getCategoryTopics(category: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            `You are a topic suggestion assistant. Generate 5 specific topics related to the ${category} category. These should be specific enough to generate detailed content about. Respond with JSON in this format: { 'topics': [array of topic strings] }`
        },
        {
          role: "user",
          content: `Generate topics in the ${category} category`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.topics || [];
  } catch (error: any) {
    console.error(`Error generating topics for category ${category}:`, error.message);
    throw new Error(`Failed to generate topics for category ${category}: ${error.message}`);
  }
}
