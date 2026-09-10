import { prisma } from "../../services/prisma.js";
import { hashedPassword } from "../../configs/hash.js";
import { SignupSchema } from "../../services/validator.js";
import type { FastifyRequest, FastifyReply } from "fastify";

export const signupModule = async(req:FastifyRequest,res:FastifyReply)=>{
    try{
        const  parsed = SignupSchema.safeParse(req.body);
        if(!parsed.success){
            return res.code(400).send({
                error: "Invalid input",
                details: parsed.error.flatten(),
            })
        };

        const {email,password} = parsed.data;

        const isExisting = await prisma.user.findUnique({where:{email}});
        if(isExisting){
            return res.code(409).send({
                error: 'user already exists with this email'
            })
        };

        const passwordHash = await hashedPassword(password);

        const user = await prisma.user.create({
            data: {email , passwordHash},
            select: { id: true, email: true },
        })

        return res.code(201).send({
            user
        })
    }
    catch(e){

        req.log?.error(e);
        return res.code(500).send({ error: "Something went wrong" });

    }
}