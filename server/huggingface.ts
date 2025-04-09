import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

interface AiResponse {
  title: string;
  content: string;
}

/**
 * Generates a detailed response based on user prompt using HuggingFace
 */
export async function generateAiResponse(prompt: string): Promise<AiResponse> {
  try {
    // Using a text generation model from HuggingFace
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: `<s>[INST] You are Taskify AI, an advanced AI assistant that provides detailed, accurate, and well-structured information in response to user prompts. Your responses should be educational and informative. Please provide a comprehensive response to the following prompt in markdown format with proper headings, lists, and paragraphs:

${prompt}

Include a concise title at the beginning that captures the essence of the prompt. [/INST]</s>`,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
      }
    });

    const fullContent = response.generated_text || '';
    
    // Add debugging
    console.log('HuggingFace response:', fullContent);
    
    // Extract response (everything after the prompt)
    const responseContent = fullContent.split('[/INST]</s>')[1]?.trim() || fullContent;
    console.log('Extracted response content:', responseContent);
    
    // Extract a title from the content
    let title = 'Generated Response';
    const lines = responseContent.split('\n');
    
    if (lines.length > 0) {
      // Look for a markdown heading or use the first line
      const titleLine = lines.find(line => line.startsWith('# ')) || lines[0];
      title = titleLine.replace(/^# /, '').trim();
      
      // If title is too long, truncate it
      if (title.length > 100) {
        title = title.substring(0, 100) + '...';
      }
      console.log('Extracted title:', title);
    }

    return {
      title,
      content: responseContent
    };
  } catch (error: any) {
    console.error('Error generating AI response:', error.message);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Generates a comprehensive report based on user prompt
 */
export async function generateReportContent(prompt: string, title: string): Promise<string> {
  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: `<s>[INST] You are Taskify AI's report generator. Create a well-formatted, comprehensive PDF report on the given prompt. The report should be structured with clear sections, bullet points where appropriate, and should be informative and educational. Format the response as well-formatted markdown that can be converted to PDF. Include a title, introduction, several content sections, and a conclusion.

Generate a detailed report on this topic: ${prompt}
Use this title: ${title} [/INST]</s>`,
      parameters: {
        max_new_tokens: 4000,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
      }
    });

    const fullContent = response.generated_text || '';
    
    // Extract response (everything after the prompt)
    const reportContent = fullContent.split('[/INST]</s>')[1]?.trim() || fullContent;
    
    return reportContent;
  } catch (error: any) {
    console.error('Error generating report content:', error.message);
    throw new Error(`Failed to generate report content: ${error.message}`);
  }
}

/**
 * Generates suggested prompts for the home page
 */
export async function getSuggestedPrompts(): Promise<string[]> {
  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: `<s>[INST] You are Taskify AI's suggestion generator. Create 6 diverse and interesting prompt suggestions that users might want to ask an AI assistant. These should cover different domains of knowledge and be phrased as questions or requests a user might type. Respond with just a list of prompts, one per line, with no additional text or explanations. [/INST]</s>`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.8,
        top_p: 0.95,
        do_sample: true,
      }
    });

    const fullContent = response.generated_text || '';
    
    // Extract response (everything after the prompt)
    const responsePart = fullContent.split('[/INST]</s>')[1]?.trim() || fullContent;
    
    // Split by newlines and remove any empty lines
    const prompts = responsePart
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('-'));
    
    // Return up to 6 prompts
    return prompts.slice(0, 6);
  } catch (error: any) {
    console.error('Error generating prompt suggestions:', error.message);
    // Return default prompts if API fails
    return [
      'Explain quantum computing in simple terms',
      'What are the latest advancements in renewable energy?',
      'How does artificial intelligence impact healthcare?',
      'What are the best practices for sustainable urban planning?',
      'Explain the process of photosynthesis in detail',
      'What are the key principles of effective leadership?'
    ];
  }
}