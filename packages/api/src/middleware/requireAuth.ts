import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../services/token.js";


export const requireAuth = async(req:FastifyRequest, res:FastifyReply)=>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.code(401).send({error: "no access token provided"})
        }

        const token = authHeader.slice(7)

        let payload;
        try{
            payload = verifyAccessToken(token);
        }
        catch(e){
            return res.code(401).send({ error: "Invalid or expired access token" });
        }

        req.user = payload


    }
    catch(e){
        req.log?.error(e)
        return res.code(500).send({ error: "Something went wrong" });
    }

}