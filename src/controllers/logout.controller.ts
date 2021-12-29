import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Context from "../utils/context";
import authHook from "../hooks/auth.hook";
import { Controller } from "./controller";

export class LogoutController implements Controller {

    public constructor(app: FastifyInstance, ctx: Context) {
        app.route({
            method: 'GET',
            url: '/logout',
            preHandler: [authHook(ctx)],
            handler: this.get.bind(this)
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        
        if(request.user.group) {

            request.session.delete();
        }

        return reply.redirect('/');
    }
}