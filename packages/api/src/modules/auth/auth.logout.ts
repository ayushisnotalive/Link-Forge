import type { FastifyRequest,FastifyReply } from "fastify";
import { prisma } from "../../services/prisma.js";
import { hashToken } from "../../services/token.js";

export const logoutModule = async(req:FastifyRequest, res:FastifyReply)=>{
    try{
        const incomingToken = req.cookies?.refreshToken;

        if(incomingToken){
            const tokenHash = hashToken(incomingToken);
            await prisma.refreshToken.update({
                where:{tokenHash, revoked:false},
                data: {revoked:true}
            })
        }
        res.clearCookie("refreshToken", {path:"/api/auth/refresh"})
         return res.code(200).send({ success: true, message: "Logged out" });

    } catch (e) {
        req.log?.error(e);
        return res.code(500).send({ error: "Somethingg wentt wrong" });
    }
    };