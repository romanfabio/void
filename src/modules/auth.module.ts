import { LoginController } from "../controllers/login.controller";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { RegisterController } from "../controllers/register.controller";
import { LogoutController } from "../controllers/logout.controller";
import Context from "../utils/context";

const authModule: FastifyPluginAsync = async (fastify: FastifyInstance, opts: any): Promise<void> => {
  const ctx = opts as Context;
  new LoginController(fastify,ctx);
  new RegisterController(fastify, ctx);
  new LogoutController(fastify, ctx);
};

export default authModule;