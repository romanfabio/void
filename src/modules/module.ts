import { FastifyInstance } from "fastify";
import fp from 'fastify-plugin';
import Context from "../utils/context";
import adminModule from "./admin.module";
import authModule from "./auth.module";
import generalModule from "./general.module";

export default function configure(ctx: Context) {

    const modules = [
        authModule,
        generalModule,
        adminModule
    ];

    return fp(async (app: FastifyInstance) : Promise<void> => {
        for (const moduleFn of modules) {
            await moduleFn(app, ctx);
        }
    })
}