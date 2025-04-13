import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config, ensureEnvFile, checkRequiredApiKeys } from "./config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // Ensure .env file exists with API keys for local development
  ensureEnvFile();
  
  // Check if all required API keys are available
  const apiKeysAvailable = checkRequiredApiKeys();
  if (!apiKeysAvailable) {
    log("WARNING: Some required API keys are missing. Functionality may be limited.");
  } else {
    log("All API keys are configured properly.");
  }
  
  // Create API endpoint to check API key status
  app.get("/api/config/status", (req, res) => {
    const status = {
      openRouter: {
        configured: !!config.openRouter.apiKey,
        // Don't send the actual key for security reasons
        masked: config.openRouter.apiKey ? 
          config.openRouter.apiKey.substring(0, 3) + '...' + 
          config.openRouter.apiKey.substring(config.openRouter.apiKey.length - 3) : 
          null
      },
      environment: config.server.environment
    };
    res.json(status);
  });
  
  // Create API endpoint to update API keys during runtime (for external environments)
  app.post("/api/config/update-key", express.json(), (req, res) => {
    const { key, value } = req.body;
    
    if (!key || !value || typeof key !== 'string' || typeof value !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request. Both 'key' and 'value' are required." 
      });
    }
    
    try {
      // Update config and .env file
      import("./config").then(configModule => {
        configModule.initializeApiKey(key, value);
        res.json({ 
          success: true, 
          message: `Successfully updated ${key}` 
        });
      });
    } catch (error) {
      console.error("Failed to update API key:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update API key" 
      });
    }
  });
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
