import type { FastifyRequest,FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";


export const deleteModule = async (req:FastifyRequest, res:FastifyReply)=>{
    try{
        const userId = req.user?.userId;

        if(!userId){
            return res.code(401).send({error:"user not authenticated"})
        }

        await prisma.user.delete({where:{id:userId}});
        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
        return res.code(204).send()
        }
        catch(e){
            req.log?.error(e)
            return res.code(500).send({error:"something went d wrong"})
        }

}