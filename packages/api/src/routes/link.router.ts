import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { createLinkModule } from "../modules/Links/links.create.js";
import { listLinksModule } from "../modules/Links/links.list.js";
import {updateLinksModule} from "../modules/Links/links.update.js";
import { deleteLinkModule } from "../modules/Links/links.delete.js";
import { BuildLinksRateLimit } from "../middleware/LinksRateLimit.js";


export default async function linksRoutes(app: FastifyInstance) {

  const LinksRateLimit = BuildLinksRateLimit(app);

  app.post("/", { preHandler: [requireAuth, LinksRateLimit]}, createLinkModule);
  app.get("/",{preHandler:[requireAuth, LinksRateLimit]}, listLinksModule);
  app.patch<{ Params: { id: string } }>(
      "/:id",
      { preHandler:[ requireAuth, LinksRateLimit] },
      updateLinksModule
    );
  app.delete<{ Params: { id: string } }>(
      "/:id",
      { preHandler: [requireAuth, LinksRateLimit] },
      deleteLinkModule
    );
}