import { FastifyInstance } from "fastify";
import fastifyRedis from "fastify-redis";
import Context from "../../utils/context";
import Forum from "../models/forum.model";
import User from "../models/user.model";
import SimpleUserCache from './simple/user.cache';
import SimpleForumCache from './simple/forum.cache';

export type CacheManager = {
    forum: IForumCache;
    user: IUserCache;
}

export interface IForumCache {

    set(name: string, forum: Forum | null): Promise<void>;

    findByName(name: string): Promise<Forum | null | undefined>;
}

export interface IUserCache {

    findByUsername(username: string): Promise<User | null | undefined>;

    set(username: string, user: User | null): Promise<void>;
}

export async function configureCaches(app: FastifyInstance, ctx: Context): Promise<CacheManager> {

    return {
        forum: new SimpleForumCache(),
        user: new SimpleUserCache()
    }

}