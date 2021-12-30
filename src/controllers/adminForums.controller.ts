import ForumRepository from "../data/repositories/forum.repo";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import Context from "../utils/context";

type PostBody = {
    forumName: string;
    action: string;
}

export class AdminForumsController implements Controller {

    private readonly forumRepo: ForumRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.forumRepo = ctx.repos.forum;


        app.route({
            method: 'GET',
            url: '/admin/forum',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this)
        });

        app.route({
            method: 'POST',
            url: '/admin/forum',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                body: {
                    type: 'object',
                    required: ['forumName', '_csrf'],
                    properties: {
                        forumName: {type: 'string', nullable: false},
                        action: {type: 'string', nullable: false},
                        _csrf: {type: 'string', nullable: false}
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {

        if(! request.user.admin) {
            return reply.redirect('/');
        }

        reply.viewArgs._csrf = await reply.generateCsrf();
        reply.viewArgs.forums = await this.forumRepo.names();
        return reply.view('adminForums.view.ejs', reply.viewArgs);
    }


    public async post(request: FastifyRequest, reply: FastifyReply): Promise<any> {

        if(! request.user.admin) {
            return reply.redirect('/');
        }

        const {forumName, action} = request.body as PostBody;

        if(action !== 'up' && action !== 'down'){
            return reply.redirect('/admin/forum');
        }

        const forums = (await this.forumRepo.names());
        const index = forums.indexOf(forumName);
        if(index < 0 || (action === 'up' && index == 0) || (action === 'down' && index == forums.length-1)) {
            return reply.redirect('/admin/forum');
        }

        if(action === 'up'){
            await this.forumRepo.moveUp(forumName, index);
        } else {
            await this.forumRepo.moveDown(forumName, index);
        }

        return reply.redirect('/admin/forum');
    }
}