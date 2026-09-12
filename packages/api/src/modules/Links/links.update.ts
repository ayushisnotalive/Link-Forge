import type { FastifyRequest,FastifyReply } from "fastify";
import { updateLinkSchema } from "./links.schema.js";
import { prisma } from "../../services/prisma.js";


export const updateLinksModule = async(req:FastifyRequest<{
    Params: {id:string}
    }>, res:FastifyReply)=>{

    try{
        const parsed = updateLinkSchema.safeParse(req.body);
        
        if(!parsed.success){
            return res.code(400).send({
                error: "Invalid request body",
                details: parsed.error.flatten().fieldErrors,});
            }
        
        const {id} = req.params;
        const userId = req.user!.userId;

        const isExisting = await prisma.shortLink.findUnique({
            where:{id},
            select:{userId:true}
        })

        if(!isExisting || isExisting.userId !== userId){
            return res.code(404).send({error:"short link not found"})
        }

        const {long_url, is_active} = parsed.data

        const updated = await prisma.shortLink.update({
            where:{id},
            data:{
                ...(long_url!== undefined && {longUrl:long_url}),
                ...(is_active!==undefined && {isActive:is_active})
            },
            select:{
                id:true,
                shortCode:true,
                longUrl:true,
                isActive:true,
                expiresAt:true,
                createdAt:true
            }
        });

        return res.code(200).send(updated);


    }catch(e){
        req.log?.error(e);
        return res.code(500).send({error:"something went wrong w.. update"})

    }

}