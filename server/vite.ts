import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  try {
    console.log("Initializing Vite server...");
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: ['localhost', '127.0.0.1'],
    };

    console.log("Creating Vite server with options:", serverOptions);
    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          console.error("Vite error:", msg, options);
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom",
    });

    console.log("Vite server created successfully");
    app.use(vite.middlewares);
    
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      console.log("Handling request:", url);

      try {
        const clientTemplate = path.join(process.cwd(), 'client', 'index.html');
        console.log("Looking for template at:", clientTemplate);

        if (!fs.existsSync(clientTemplate)) {
          throw new Error(`Template file not found at: ${clientTemplate}`);
        }

        // always reload the index.html file from disk incase it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        console.error("Error handling request:", e);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (error) {
    console.error("Failed to setup Vite:", error);
    throw error;
  }
}

export function serveStatic(app: Express) {
  try {
    console.log("Setting up static file serving...");
    const distPath = path.join(process.cwd(), 'dist', 'public');
    console.log("Looking for static files in:", distPath);

    if (!fs.existsSync(distPath)) {
      const error = new Error(
        `Could not find the build directory: ${distPath}, make sure to build the client first`,
      );
      console.error(error.message);
      throw error;
    }

    console.log("Found static files directory");
    app.use(express.static(distPath));

    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log("Serving index.html from:", indexPath);
      res.sendFile(indexPath);
    });
  } catch (error) {
    console.error("Failed to setup static file serving:", error);
    throw error;
  }
}
