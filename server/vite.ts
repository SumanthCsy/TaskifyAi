import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import type { Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const log = console.log;

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.join(process.cwd(), "dist");
  const publicPath = path.join(distPath, "public");

  if (!fs.existsSync(publicPath)) {
    console.log("Creating public directory:", publicPath);
    fs.mkdirSync(publicPath, { recursive: true });
  }

  app.use(express.static(publicPath));
}
