import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";
import { redis } from "../../services/redis.js";

const GO_ANALYTICS_URL = process.env.GO_ANALYTICS_URL || "http://localhost:8080";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || "internal_secret";

function sendAnalyticsEvent(linkId: string, req: FastifyRequest) {
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || "";
  const userAgent = req.headers["user-agent"] || "";
  const referrer = req.headers["referer"] || "";

  // Basic device detection based on user agent (can be improved)
  let deviceType = "Desktop";
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = "Mobile";
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = "Tablet";
  }

  const payload: Record<string, string> = {
    shortLinkId: linkId,
    ipAddress: String(ipAddress),
    userAgent,
    deviceType,
  };

  if (referrer) {
    payload.referrer = referrer;
  }

  // Fire and forget
  fetch(`${GO_ANALYTICS_URL}/api/v1/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    req.log?.error(err, "Failed to send analytics event");
  });
}

export const redirectModule = async (
  req: FastifyRequest<{ Params: { code: string } }>,
  res: FastifyReply
) => {
  const { code } = req.params;
  const cacheKey = `redirect_v2:${code}`; // new cache key to avoid conflicts

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      sendAnalyticsEvent(parsed.id, req);
      return res.code(302).redirect(parsed.longUrl);
    } catch (e) {
      // fallback if cache parse fails
    }
  }

  const link = await prisma.shortLink.findUnique({
    where: { shortCode: code },
    select: {
      id: true,
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

  const cachePayload = JSON.stringify({
    id: link.id,
    longUrl: link.longUrl
  });

  await redis.set(cacheKey, cachePayload, "EX", 300);

  sendAnalyticsEvent(link.id, req);

  return res.code(302).redirect(link.longUrl);
};
