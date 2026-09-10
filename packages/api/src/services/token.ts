import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../configs/env.js';
import {prisma} from './prisma.js'


type TokenPayload = { userId : string, email: string};

export const generateAccessToken = (payload: TokenPayload)=>
    jwt.sign(payload , env.JWT_ACCESS_SECRET,{expiresIn:"15m"});

export const generateRefreshToken = (payload: TokenPayload)=>
    jwt.sign(payload, env.JWT_REFRESH_SECRET,{expiresIn:"7d"});


export const verifyAccessToken = (token:string)=>
    jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token:string)=>
    jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;


export const hashToken = (token:string)=>
    crypto.createHash('sha256').update(token).digest('hex')

export const storeRefreshToken = async(userId:string , token:string)=>{
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  //---> it means 7 days;

         return prisma.refreshToken.create({
            data:{userId,tokenHash,expiresAt}
         });

    };

// revoke every refresh token for a user — used on reuse detection or logout-all

export const revokeAlluserToken = (userId:string)=>{
    prisma.refreshToken.updateMany({
        where:{userId, revoked:false},
        data: {revoked:true}
    })
}