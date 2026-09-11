import type { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "../../services/prisma.js";
import { createLinkSchema } from "./links.schema.js";
import { generateShortCode } from "../../services/shortCode.js";

const MAX_RETRIES = 5;

export const createLinkModule = async(req:FastifyRequest, res:FastifyReply) =>{

        const parsed = createLinkSchema.safeParse(req.body);

        if(!parsed.success){
            return res.code(401).send({
                error:"invalid request body",
                details:parsed.error.flatten().fieldErrors,
            });
        }

        const {long_url} = parsed.data;
        const userId = req.user!.userId

        let attempt = 0;

        while(attempt<MAX_RETRIES){
            const shortCode = generateShortCode();
            try{
                const link = await prisma.shortLink.create({
                    data:{
                        userId,
                        longUrl : long_url,
                        shortCode
                    },
                    select:{
                        id:true,
                        shortCode:true,
                        longUrl:true,
                        isActive:true,
                        expiresAt:true,
                        createdAt:true
                    },
                })
                return res.code(201).send(link)
            }
            catch(e){
                if( e instanceof PrismaClientKnownRequestError && e.code === "P2002"){
                    attempt++;
                    continue;
                }

                req.log?.error(e);
                return res.code(500).send({ error: "Something went wrong" });
            }

        }

        req.log?.error("Exhausted short code retries");
        return res.code(500).send({ error: "Could not generate a unique short code, try again" });

}