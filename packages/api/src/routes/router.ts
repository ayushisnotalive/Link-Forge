import type{ FastifyInstance } from "fastify";



import { signupModule } from "../modules/auth/auth.signup.js";
import { loginModule } from "../modules/auth/auth.login.js";




// auths
export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", signupModule);
  app.post("/login",loginModule);
};