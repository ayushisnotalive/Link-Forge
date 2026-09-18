import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

interface MockLink {
  id: string;
  userId: string;
  shortCode: string;
  longUrl: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  clicks: number;
}

const mockLinks: MockLink[] = [
  {
    id: "sample-1",
    userId: "user-1",
    shortCode: "forge",
    longUrl: "https://github.com/ayushisnotalive/Link-Forge",
    isActive: true,
    expiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    clicks: 14,
  },
  {
    id: "sample-2",
    userId: "user-1",
    shortCode: "docs",
    longUrl: "https://developer.mozilla.org",
    isActive: true,
    expiresAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    clicks: 6,
  },
];

function parseJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function mockApiPlugin(): Plugin {
  return {
    name: "link-forge-mock-api",
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost:3000"}`);
        const pathname = parsedUrl.pathname;
        const method = req.method || "GET";

        // CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (method === "OPTIONS") {
          res.statusCode = 204;
          return res.end();
        }

        // Auth: Signup
        if (pathname === "/api/auth/signup" && method === "POST") {
          const body = await parseJsonBody(req);
          const email = typeof body.email === "string" ? body.email : "user@example.com";
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 201;
          return res.end(JSON.stringify({ user: { id: "user-1", email } }));
        }

        // Auth: Login
        if (pathname === "/api/auth/login" && method === "POST") {
          const body = await parseJsonBody(req);
          const email = typeof body.email === "string" ? body.email : "user@example.com";
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              message: "Login successful",
              accessToken: "mock_jwt_access_token_" + Date.now(),
              user: { id: "user-1", email },
            })
          );
        }

        // Auth: Refresh
        if (pathname === "/api/auth/refresh" && method === "POST") {
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          return res.end(JSON.stringify({ accessToken: "mock_jwt_access_token_" + Date.now() }));
        }

        // Auth: Logout
        if (pathname === "/api/auth/logout" && method === "POST") {
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        // Links: List
        if (pathname === "/api/links" && method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          return res.end(
            JSON.stringify(
              mockLinks.map((l) => ({
                id: l.id,
                shortCode: l.shortCode,
                longUrl: l.longUrl,
                isActive: l.isActive,
                expiresAt: l.expiresAt,
                createdAt: l.createdAt,
              }))
            )
          );
        }

        // Links: Create
        if (pathname === "/api/links" && method === "POST") {
          const body = await parseJsonBody(req);
          const rawUrl = body.long_url || body.longUrl;
          const longUrl = typeof rawUrl === "string" ? rawUrl : "";
          if (!longUrl) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Missing long URL" }));
          }

          const shortCode = Math.random().toString(36).substring(2, 8);
          const newLink: MockLink = {
            id: "link-" + Date.now(),
            userId: "user-1",
            shortCode,
            longUrl,
            isActive: true,
            expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            clicks: 0,
          };
          mockLinks.unshift(newLink);

          res.setHeader("Content-Type", "application/json");
          res.statusCode = 201;
          return res.end(
            JSON.stringify({
              id: newLink.id,
              shortCode: newLink.shortCode,
              longUrl: newLink.longUrl,
              isActive: newLink.isActive,
              expiresAt: newLink.expiresAt,
              createdAt: newLink.createdAt,
            })
          );
        }

        // Links: Update (Patch)
        if (pathname.startsWith("/api/links/") && method === "PATCH") {
          const id = pathname.replace("/api/links/", "");
          const body = await parseJsonBody(req);
          const link = mockLinks.find((l) => l.id === id);

          if (!link) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: "Short link not found" }));
          }

          if (body.is_active !== undefined) link.isActive = Boolean(body.is_active);
          if (body.long_url !== undefined && typeof body.long_url === "string") link.longUrl = body.long_url;

          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              id: link.id,
              shortCode: link.shortCode,
              longUrl: link.longUrl,
              isActive: link.isActive,
              expiresAt: link.expiresAt,
              createdAt: link.createdAt,
            })
          );
        }

        // Links: Delete
        if (pathname.startsWith("/api/links/") && method === "DELETE") {
          const id = pathname.replace("/api/links/", "");
          const index = mockLinks.findIndex((l) => l.id === id);
          if (index !== -1) {
            mockLinks.splice(index, 1);
          }
          res.statusCode = 204;
          return res.end();
        }

        // Analytics: Get
        if (pathname.startsWith("/api/v1/analytics/")) {
          const code = pathname.replace("/api/v1/analytics/", "").split("/")[0];
          const link = mockLinks.find((l) => l.shortCode === code);
          const clicks = link ? link.clicks : 1;

          const today = new Date().toISOString().split("T")[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          const dayBefore = new Date(Date.now() - 172800000).toISOString().split("T")[0];

          const stats = {
            totalClicks: clicks,
            timeSeries: [
              { date: dayBefore, count: Math.floor(clicks * 0.2) },
              { date: yesterday, count: Math.floor(clicks * 0.3) },
              { date: today, count: Math.ceil(clicks * 0.5) },
            ],
            topReferrers: [
              { referrer: "Direct", count: Math.ceil(clicks * 0.6) },
              { referrer: "github.com", count: Math.floor(clicks * 0.4) },
            ],
            deviceBreakdown: [
              { deviceType: "Desktop", count: Math.ceil(clicks * 0.7) },
              { deviceType: "Mobile", count: Math.floor(clicks * 0.3) },
            ],
          };

          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          return res.end(JSON.stringify(stats));
        }

        // Short link redirection: /:code
        const segments = pathname.split("/").filter(Boolean);
        if (
          segments.length === 1 &&
          method === "GET" &&
          !pathname.startsWith("/api") &&
          !pathname.startsWith("/@") &&
          !pathname.startsWith("/src") &&
          !pathname.startsWith("/node_modules") &&
          !pathname.includes(".") &&
          !["login", "signup", "dashboard"].includes(segments[0])
        ) {
          const code = segments[0];
          const link = mockLinks.find((l) => l.shortCode === code);
          if (link) {
            if (link.isActive) {
              link.clicks = (link.clicks || 0) + 1;
              res.statusCode = 302;
              res.setHeader("Location", link.longUrl);
              return res.end();
            } else {
              res.statusCode = 404;
              return res.end("Short link disabled");
            }
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mockApiPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
  },
});
