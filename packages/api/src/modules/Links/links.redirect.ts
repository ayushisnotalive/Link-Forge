import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";

export const redirectModule = async (
  req: FastifyRequest<{ Params: { code: string } }>,
  res: FastifyReply
) => {
  const { code } = req.params;

  const link = await prisma.shortLink.findUnique({
    where: { shortCode: code },
    select: {
      longUrl: true,
      isActive: true,
      expiresAt: true,
    },
  });

  if (!link) {
    return res.code(404).send({ error: "Short link not found" });
  }

  if (!link.isActive) {
    return res.code(404).send({ error: "Short link not found" });
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    return res.code(410).send({ error: "This short link has expired" });
  }

  return res.code(302).redirect(link.longUrl);
};