import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";

export const listLinksModule = async(req:FastifyRequest, res:FastifyReply)=>{
    try{
        const userId = req.user!.userId;

        if(!userId){
            return res.code(401).send({error:"invalid user"})
        }

        const links = await prisma.shortLink.findMany({
            where:{userId},
            orderBy:{createdAt:'desc'},
            select:{
                id:true,
                shortCode:true,
                longUrl:true,
                createdAt:true,
                expiresAt:true,
                updatedAt:true
            }
        })

        return res.code(200).send(links)
    }
    catch(e){
        req.log?.error(e)
        return res.code(500).send({
            error:"take a chill pill... try logging in and fetching your lists again ,\n else if this error is from our side we will be fixing it soon for sure"
        })

    }
}