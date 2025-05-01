import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config, ensureEnvFile, checkRequiredApiKeys } from "./config";
import { readdirSync } from 'fs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the dist directory
const distPath = path.join(process.cwd(), 'dist');
const publicPath = path.join(distPath, 'public');

// Ensure the public directory exists
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Serve static files
app.use(express.static(publicPath));

// Add error handling middleware at the start
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server initialization...");
    console.log("Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      PORT: process.env.PORT,
      PWD: process.cwd(),
      Files: readdirSync('.'),
      DistPath: distPath,
      PublicPath: publicPath
    });

    // Ensure .env file exists with API keys for local development
    ensureEnvFile();
    
    // Check if all required API keys are available
    const apiKeysAvailable = checkRequiredApiKeys();
    if (!apiKeysAvailable) {
      console.error("WARNING: Some required API keys are missing. Functionality may be limited.");
    } else {
      console.log("All API keys are configured properly.");
    }
    
    // Create API endpoint to check API key status
    app.get("/api/config/status", (req, res) => {
      try {
        const status = {
          openRouter: {
            configured: !!config.openRouter.apiKey,
            // Don't send the actual key for security reasons
            masked: config.openRouter.apiKey ? 
              config.openRouter.apiKey.substring(0, 3) + '...' + 
              config.openRouter.apiKey.substring(config.openRouter.apiKey.length - 3) : 
              null
          },
          environment: config.server.environment,
          envVars: {
            hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
            nodeEnv: process.env.NODE_ENV,
            vercel: !!process.env.VERCEL
          }
        };
        res.json(status);
      } catch (error) {
        console.error("Error in /api/config/status:", error);
        res.status(500).json({ error: "Failed to get config status" });
      }
    });
    
    // Create API endpoint to update API keys during runtime (for external environments)
    app.post("/api/config/update-key", express.json(), (req, res) => {
      try {
        const { key, value } = req.body;
        
        if (!key || !value || typeof key !== 'string' || typeof value !== 'string') {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid request. Both 'key' and 'value' are required." 
          });
        }
        
        // Update config and .env file
        import("./config").then(configModule => {
          configModule.initializeApiKey(key, value);
          res.json({ 
            success: true, 
            message: `Successfully updated ${key}` 
          });
        }).catch(error => {
          console.error("Failed to update API key:", error);
          res.status(500).json({ 
            success: false, 
            message: "Failed to update API key",
            error: error.message
          });
        });
      } catch (error: unknown) {
        console.error("Error in /api/config/update-key:", error);
        res.status(500).json({ 
          success: false, 
          message: "Internal server error",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    const server = await registerRoutes(app);

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use Vercel's PORT environment variable if available, otherwise default to 5000
    const port = process.env.PORT || 5000;
    
    // Only start the server if not running on Vercel
    if (!process.env.VERCEL) {
      server.listen(port, () => {
        log(`serving on port ${port}`);
      });
    }

    console.log("Server initialization completed successfully");
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
})();

// Export the Express API for Vercel
export default app;
