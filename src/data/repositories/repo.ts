import { configureCaches } from "../cache/Icache";
import { FastifyInstance } from "fastify";
import knex from "knex";
import Context from "../../utils/context";
import ForumRepository from "./forum.repo";
import GroupRepository from "./group.repo";
import PostRepository from "./post.repo";
import UserRepository from "./user.repo";
import VariableRepository from "./variable.repo";

export type RepoType = {
    variable: VariableRepository;
    user: UserRepository;
    forum: ForumRepository;
    post: PostRepository;
    group: GroupRepository;
}

export default async (app: FastifyInstance, ctx: Context) : Promise<RepoType> => {
    const db = knex({
      client: 'pg',
      connection: ctx.env.database,
      debug: true
    });
  
    const caches = await configureCaches(app, ctx);
  
    const repos : RepoType = {
      variable: new VariableRepository(db),
      user: new UserRepository(caches.user, db),
      forum: new ForumRepository(caches.forum, db),
      post: new PostRepository(db),
      group: new GroupRepository(db)
    }
  
    await repos.variable?.load();
    await repos.group?.load();

    return repos;
}