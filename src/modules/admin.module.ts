import { AdminForumsController } from "../controllers/adminForums.controller";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { AdminGeneralController } from "../controllers/adminGeneral.controller";
import { AdminNewForumController } from "../controllers/adminNewForum.controller";
import Context from "../utils/context";
import { AdminPexController } from "../controllers/adminPex.controller";

const adminModule: FastifyPluginAsync = async (fastify: FastifyInstance, opts: any): Promise<void> => {
  const ctx = opts as Context;
  new AdminGeneralController(fastify, ctx);
  new AdminForumsController(fastify,ctx);
  new AdminNewForumController(fastify, ctx);
  new AdminPexController(fastify, ctx);
};

export default adminModule;