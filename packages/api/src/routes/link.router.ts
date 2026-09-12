import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { createLinkModule } from "../modules/Links/links.create.js";
import { listLinksModule } from "../modules/Links/links.list.js";
import {updateLinksModule} from "../modules/Links/links.update.js";
import { deleteLinkModule } from "../modules/Links/links.delete.js";


export default async function linksRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: requireAuth }, createLinkModule);
  app.get("/",{preHandler:requireAuth}, listLinksModule);
  app.patch<{ Params: { id: string } }>(
      "/:id",
      { preHandler: requireAuth },
      updateLinksModule
    );
  app.delete<{ Params: { id: string } }>(
      "/:id",
      { preHandler: requireAuth },
      deleteLinkModule
    );
}