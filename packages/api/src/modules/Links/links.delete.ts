import type { FastifyRequest,FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";
import { redis } from "../../services/redis.js";

export const deleteLinkModule = async (
        req: FastifyRequest<{ Params: { id: string } }>,
        res: FastifyReply
    )=>{
        try{
            const {id} = req.params;
            const userId = req.user!.userId;

            const isExisting = await prisma.shortLink.findUnique({
                where:{id},
                select:{userId:true, shortCode:true}
            });

            if (!isExisting || isExisting.userId !== userId) {
                return res.code(404).send({ error: "Short link not found" });
            };

            await prisma.shortLink.delete({
                where:{id}
            });

            await redis.del(`redirect:${isExisting.shortCode}`);

            return res.code(204).send()


        }
        catch(e){
            req.log?.error(e)
            return res.code(500).send({
                error: "something went wrong w deleting link"
            })
        }
    }