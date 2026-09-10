import { prisma } from "../../services/prisma.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { generateRefreshToken,
    generateAccessToken,
    verifyAccessToken,
    verifyRefreshToken,
    storeRefreshToken,
    revokeAlluserToken,
    hashToken
 } from "../../services/token.js";
 import cookie from '@fastify/cookie'
import { error } from "console";


 export const refreshModule = async(req:FastifyRequest, res:FastifyReply)=>{
    try{
        const incomingToken = req.cookies?.refreshToken;

        if(!incomingToken){
           return res.code(401).send(
                {
                    error:"no refresh token provided"
                }
            )
        }

        // 1. Verify sign expiry first —---> cheap check, fail fast

        let payload;
        try{
            payload = verifyRefreshToken(incomingToken);
        }
        catch(e){
             return res.code(401).send({ error: "Invalid or expired refresh token" });
        }

        const tokenHash = hashToken(incomingToken);
        const storedToken = await prisma.refreshToken.findUnique({
            where:{ tokenHash },
        })

    }
    catch(e){

    }
 }