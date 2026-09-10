import {z} from 'zod'

export const SignupSchema = z.object({
    email: z.string(),
    password : z.string()
});

export const LoginSChema = z.object({
    email: z.string(),
    password: z.string()
});

