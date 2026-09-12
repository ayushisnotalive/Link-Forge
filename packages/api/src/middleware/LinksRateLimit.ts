import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";


export function BuildLinksRateLimit (app:FastifyInstance){
    const checkRateLimit = app.createRateLimit({
        max:30,
        timeWindow:"1 minute",
        keyGenerator:(request:FastifyRequest) => request.user!.userId
    });

    return async function LinksRateLimit(req:FastifyRequest, res:FastifyReply){
        const limit = await checkRateLimit(req);
        if(!limit.isAllowed && limit.isExceeded){
            return res.code(429).send({error: "too many requests , slow down boi"})
        }
    };
}   