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


 export const refreshModule = async(req:FastifyRequest, res:FastifyReply)=>{
    try{
        let incomingToken = req.cookies?.refreshToken;

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

        let tokenHash = hashToken(incomingToken);

        // 2. look for this token in DB
        let storedToken = await prisma.refreshToken.findUnique({
            where:{ tokenHash },
        });

         // 3. Reuse detection: token not found, or already revoked

        if(!storedToken||storedToken.revoked){
            if (storedToken) {
                await revokeAlluserToken(storedToken.userId); // this will kill all sessions.. hehe...
            }
        return res.code(401).send({
            error:"Refresh token reuse detected. Please log in again."  // Someone is presenting a token we already rotated away from or one that never existed ,treat as compromise.

        })
        }

        if(storedToken.expiresAt<new Date()){
        return res.code(401).send({error:"token is expired"})
        }

        // 4. Valid — rotate: revoke old, issue new pair

        await prisma.refreshToken.update({
        where:{id:storedToken.id},
        data:{revoked:true}
        })


        const user = await prisma.user.findUnique({where:{id:payload.userId}})
        if (!user) {
        return res.code(401).send({ error: "User no longer exists" });
        }

        const newAccessToken = generateAccessToken({userId:user.id, email:user.email});
        const newRefreshToken = generateRefreshToken({userId:user.id, email:user.email})

        await storeRefreshToken(user.id, newRefreshToken)

        res.setCookie('refreshToken', newRefreshToken,{
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/api/auth/refresh",
                })

        return res.code(200).send({ accessToken: newAccessToken });
  } catch (e) {
    req.log?.error(e);
    return res.code(500).send({ error: "Something went terribly wrong" });
  }
};