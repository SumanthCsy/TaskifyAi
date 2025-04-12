import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Generate an image based on a text prompt using Hugging Face's Stable Diffusion
 * @param prompt The text prompt to generate an image from
 * @returns The generated image as a Buffer, or null if there was an error
 */
export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    // Check if API key is set
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('HuggingFace API key is not set');
      throw new Error('HuggingFace API key is not set');
    }
    
    console.log(`Generating image for prompt: "${prompt}"`);
    
    // Use a stable diffusion model to generate an image
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-2',
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, bad quality, distorted, disfigured',
        guidance_scale: 7.5,
        num_inference_steps: 30,
      }
    });
    
    // Convert the blob to a buffer
    if (!(response instanceof Blob)) {
      console.error('Unexpected response format:', typeof response);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

/**
 * Generate an image for a topic or concept, with a descriptive prompt
 * @param topic The topic or concept to generate an image for
 * @returns The generated image as a Buffer, or null if there was an error
 */
export async function generateImageForTopic(topic: string): Promise<Buffer | null> {
  // Create a more descriptive prompt for better image generation
  const enhancedPrompt = `High quality digital art illustration of ${topic}, detailed, professional, vibrant colors, trending on artstation`;
  return generateImage(enhancedPrompt);
}

/**
 * Generate an avatar or profile image based on a name or concept
 * @param name The name or concept to generate an avatar for
 * @returns The generated avatar image as a Buffer, or null if there was an error
 */
export async function generateAvatar(name: string): Promise<Buffer | null> {
  // Create a more descriptive prompt for avatar generation
  const avatarPrompt = `Professional profile photo avatar of a ${name}, high quality, business style, neutral background, looking at camera, professional lighting`;
  return generateImage(avatarPrompt);
}