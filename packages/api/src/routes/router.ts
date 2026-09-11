import type{ FastifyInstance } from "fastify";



import { signupModule } from "../modules/auth/auth.signup.js";
import { loginModule } from "../modules/auth/auth.login.js";
import { refreshModule } from "../modules/auth/auth.refresh.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getMeModule } from "../modules/auth/auth.getMe.js";
import { deleteModule } from "../modules/auth/auth.delete.js";



// auths
export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", signupModule);
  app.post("/login",loginModule);
  app.post("/refresh", refreshModule);
  app.get("/me", {preHandler:requireAuth},getMeModule);
  app.delete("/delete",{preHandler:requireAuth},deleteModule);

};