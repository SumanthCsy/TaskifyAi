import Replicate from 'replicate';

// Initialize Replicate with API key from environment
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Generate an image based on a text prompt using Replicate's Stable Diffusion
 * @param prompt The text prompt to generate an image from
 * @returns The generated image as a Buffer, or null if there was an error
 */
export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    // Check if API key is set
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Replicate API token is not set');
      throw new Error('Replicate API token is not set');
    }
    
    console.log(`Generating image for prompt: "${prompt}"`);
    
    // Use Stability AI's Stable Diffusion model
    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: prompt,
          image_dimensions: "512x512",
          negative_prompt: "blurry, bad quality, distorted, disfigured",
          num_outputs: 1,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      }
    );
    
    // The output should be an array with one or more image URLs
    if (Array.isArray(output) && output.length > 0) {
      const imageUrl = output[0] as string;
      
      // Fetch the image and convert to buffer
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else {
      console.error('Unexpected output format from Replicate:', output);
      return null;
    }
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