import type{ FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit"


import { signupModule } from "../modules/auth/auth.signup.js";
import { loginModule } from "../modules/auth/auth.login.js";
import { refreshModule } from "../modules/auth/auth.refresh.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getMeModule } from "../modules/auth/auth.getMe.js";
import { deleteModule } from "../modules/auth/auth.delete.js";
import { logoutModule } from "../modules/auth/auth.logout.js";



// auths
export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", 
    {config:{ rateLimit: { max: 5, timeWindow: "1 minute" } }},signupModule);
  app.post("/login",{config:{ rateLimit: { max: 5, timeWindow: "1 minute" } }},loginModule);
  app.post("/logout", {preHandler:requireAuth},logoutModule);
  app.post("/refresh", refreshModule);
  app.get("/me", {preHandler:requireAuth},getMeModule);
  app.delete("/delete",{preHandler:requireAuth},deleteModule);

};