import type { FastifyInstance } from "fastify";
import { redirectModule } from "../modules/Links/links.redirect.js";

export default async function redirectRoutes(app: FastifyInstance) {
  app.get("/:code", redirectModule);
}