import { FastifyInstance } from "fastify";
import fastifyRedis from "fastify-redis";
import Context from "../../utils/context";
import Forum from "../models/forum.model";
import User from "../models/user.model";
import SimpleUserCache from './simple/user.cache';
import SimpleForumCache from './simple/forum.cache';

export type CacheType = {
    forum: IForumCache;
    user: IUserCache;
}

export interface IForumCache {

    names(): Promise<string[] | null>;

    cacheNames(names: string[]): Promise<void>;

    cache(forum: Forum): Promise<void>;

    findByName(name: string): Promise<Forum | null>;
}

export interface IUserCache {

    findByUsername(username: string): Promise<User | null>;

    cache(user: User): Promise<void>;
}

export async function configureCaches(app: FastifyInstance, ctx: Context): Promise<CacheType> {


    return {
        forum: new SimpleForumCache(),
        user: new SimpleUserCache()
    }


}