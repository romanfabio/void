import { HomeController } from "../controllers/home.controller";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ForumController } from "../controllers/forum.controller";
import { PostController } from "../controllers/post.controller";
import { NewPostController } from "../controllers/newPost.controller";
import Context from "../utils/context";

const generalModule: FastifyPluginAsync = async (fastify: FastifyInstance, opts: any): Promise<void> => {
  const ctx = opts as Context;
  new HomeController(fastify,ctx);
  new ForumController(fastify,ctx);
  new PostController(fastify,ctx);
  new NewPostController(fastify,ctx);
};

export default generalModule;