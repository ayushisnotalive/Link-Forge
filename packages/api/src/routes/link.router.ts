import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { createLinkModule } from "../modules/Links/links.create.js";


export default async function linksRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: requireAuth }, createLinkModule);
}