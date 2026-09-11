import type{ FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";

export const getMeModule = async (req:FastifyRequest, res:FastifyReply)=>{

    try{
    const userId = req.user?.userId;
    
    if(!userId){
        return res.code(401).send({error:"not authenticated"})
    }

    const user = await prisma.user.findUnique({
        where:{id:userId},
        select:{id:true, email:true}
    });

    if(!user){
        return res.code(401).send({error:"user not found"})
    }

    return res.code(200).send({user});
    }

    catch(e){
        req.log?.error(e)
        return res.code(500).send({error: "something went wrongg"})
    }
}
