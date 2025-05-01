/**
 * Config and environment variables management
 * This module provides a centralized way to access environment variables
 * with fallback mechanisms for different environments
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Default config file paths
const ENV_PATHS = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production'
];

// Try to load environment variables from various potential locations
function loadEnvFiles() {
  for (const envPath of ENV_PATHS) {
    try {
      if (fs.existsSync(envPath)) {
        console.log(`Loading environment variables from ${envPath}`);
        dotenv.config({ path: envPath });
      }
    } catch (error) {
      console.warn(`Error loading env file ${envPath}:`, error);
    }
  }
}

// Load environment variables from files if available
loadEnvFiles();

/**
 * Configuration object with all environment variables and API keys
 */
export const config = {
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '' // Fallback to empty string if not set
  },
  server: {
    port: process.env.PORT || '5000',
    environment: process.env.NODE_ENV || 'development'
  },
  database: {
    url: process.env.DATABASE_URL || ''
  }
};

// Add detailed logging for API key configuration
console.log("Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "Key is set" : "No key found",
  configApiKey: config.openRouter.apiKey ? "Key is set" : "No key found",
  allEnvVariables: Object.keys(process.env)
});

// Create a local .env file with the API key if it doesn't exist
export function ensureEnvFile() {
  // Only run this in development mode
  if (config.server.environment !== 'development') {
    return;
  }

  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    try {
      // Write the API key to a .env file
      if (config.openRouter.apiKey) {
        fs.writeFileSync('.env', `OPENROUTER_API_KEY=${config.openRouter.apiKey}\n`);
        console.log('Created .env file with API key for local development');
      } else {
        console.warn('API key not found in environment. Cannot create .env file.');
      }
    } catch (error) {
      console.error('Failed to create .env file:', error);
    }
  }
}

/**
 * Check if required API keys are available
 * @returns True if all required API keys are set
 */
export function checkRequiredApiKeys(): boolean {
  const requiredKeys = [
    { name: 'OpenRouter API Key', value: config.openRouter.apiKey }
  ];

  let allKeysPresent = true;
  for (const key of requiredKeys) {
    if (!key.value) {
      console.error(`Missing required API key: ${key.name}`);
      allKeysPresent = false;
    }
  }

  return allKeysPresent;
}

// Add a function to initialize .env file with a given API key
export function initializeApiKey(key: string, value: string): void {
  try {
    // Create or update the .env file
    const envContent = fs.existsSync('.env') 
      ? fs.readFileSync('.env', 'utf-8') 
      : '';
    
    // Check if the key already exists in the file
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      // Update existing key
      const updatedContent = envContent.replace(regex, `${key}=${value}`);
      fs.writeFileSync('.env', updatedContent);
      
      // Also set it in the current environment
      process.env[key] = value;
      
      // Update the config object
      if (key === 'OPENROUTER_API_KEY') {
        config.openRouter.apiKey = value;
      }
      
      console.log(`Updated ${key} in .env file`);
    } else {
      // Add new key
      fs.writeFileSync('.env', `${envContent ? envContent + '\n' : ''}${key}=${value}`);
      
      // Also set it in the current environment
      process.env[key] = value;
      
      // Update the config object
      if (key === 'OPENROUTER_API_KEY') {
        config.openRouter.apiKey = value;
      }
      
      console.log(`Added ${key} to .env file`);
    }
  } catch (error) {
    console.error(`Failed to initialize ${key}:`, error);
  }
}

// Package.json check for dotenv dependency
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const hasDotenv = packageJson.dependencies?.dotenv || packageJson.devDependencies?.dotenv;
    
    if (!hasDotenv) {
      console.warn('dotenv package not found in package.json. Environment variables might not load correctly.');
      console.warn('Consider adding dotenv: npm install dotenv');
    }
  }
} catch (error) {
  console.warn('Failed to check package.json for dotenv dependency:', error);
}