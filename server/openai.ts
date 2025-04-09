import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AiResponse {
  title: string;
  content: string;
}

/**
 * Generates a detailed response based on user prompt
 */
export async function generateAiResponse(prompt: string): Promise<AiResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are Taskify AI, an advanced AI assistant that provides detailed, accurate, and well-structured information in response to user prompts. Your responses should be educational and informative. Format your response as JSON with the following structure: { title: 'A concise title that captures the essence of the prompt', content: 'The detailed response in markdown format with proper headings, lists, and paragraphs' }"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Response to: " + prompt.substring(0, 30) + "...",
      content: result.content || "Sorry, I couldn't generate a response for this prompt."
    };
  } catch (error: any) {
    console.error("Error generating AI response:", error.message);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Generates a comprehensive report based on user prompt
 */
export async function generateReportContent(prompt: string, title: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are Taskify AI's report generator. Create a well-formatted, comprehensive PDF report on the given prompt. The report should be structured with clear sections, bullet points where appropriate, and should be informative and educational. Format the response as a string of well-formatted markdown that can be converted to PDF. Include a title, introduction, several content sections, and a conclusion."
        },
        {
          role: "user",
          content: `Generate a detailed report on this topic: ${prompt}\nUse this title: ${title}`
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error generating report content:", error.message);
    throw new Error(`Failed to generate report content: ${error.message}`);
  }
}

/**
 * Generates suggested prompts for the home page
 */
export async function getSuggestedPrompts(): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are Taskify AI's suggestion generator. Create 6 diverse and interesting prompt suggestions that users might want to ask an AI assistant. These should cover different domains of knowledge and be phrased as questions or requests a user might type. Respond with JSON in this format: { 'prompts': [array of prompt strings] }"
        },
        {
          role: "user",
          content: "Generate prompt suggestions"
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.prompts || [];
  } catch (error: any) {
    console.error("Error generating prompt suggestions:", error.message);
    throw new Error(`Failed to generate prompt suggestions: ${error.message}`);
  }
}
