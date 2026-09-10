import { prisma } from "../../services/prisma.js";
import { verifyPassword } from "../../configs/hash.js";
import type { FastifyRequest,FastifyReply } from "fastify";
import { LoginSChema } from "../../services/validator.js";
import { generateRefreshToken } from "../../services/token.js";
import { generateAccessToken } from "../../services/token.js";
import { storeRefreshToken } from "../../services/token.js";
import cookie from '@fastify/cookie'


export const loginModule =async(req:FastifyRequest, res:FastifyReply)=>{

    try{
        const parsed = LoginSChema.safeParse(req.body);
        if(!parsed.success){
            return res.code(400).send({
                error:'invalid input',
                details: parsed.error.flatten()
            });
        }

        const {email , password} = parsed.data;
        
        const user = await prisma.user.findUnique({where:{email}});

        if(!user){
            return res.code(401).send({
                error: "Invalid email or password"
            })
        }

        const isPassword = await verifyPassword(password, user.passwordHash);

        if(!isPassword){
            return res.code(401).send({
                error: "Invalid email or password"
            })
        }

        const refreshToken = generateRefreshToken({userId: user.id, email:user.email });
        const accessToken = generateAccessToken({userId:user.id, email:user.email});

        await storeRefreshToken(user.id,refreshToken);


        res.setCookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/api/auth/refresh",
            });



        return res.code(200).send({
            success: true,
            message: 'Login successful',
            accessToken,
            user: { id: user.id, email: user.email },
        });

    }catch(e){
        req.log?.error(e);
        return res.code(500).send({ error: "Something went wrong" });

    }
}