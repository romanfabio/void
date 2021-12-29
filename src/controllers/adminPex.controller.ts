import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isForumName } from "../utils/validator";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import Context from "../utils/context";
import GroupRepository from "data/repositories/group.repo";
import { Group, PexManager } from "../utils/pex";



export class AdminPexController implements Controller {

    private readonly groupRepo: GroupRepository;
    private readonly pex: PexManager;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.groupRepo = ctx.repos.group;
        this.pex = ctx.pex;

        app.route({
            method: 'GET',
            url: '/admin/pex',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this)
        });

        app.route({
            method: 'POST',
            url: '/admin/pex',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                body: {
                    type: 'object',
                    required: ['_csrf'],
                    properties: {
                        'ANO_REGISTER': {type: 'string', nullable: false},
                        '_csrf': { type: 'string', nullable: false }
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply) : Promise<any> {

        if(! request.user.admin) {
            return reply.redirect('/');
        }

        reply.viewArgs.anonymousMask = this.pex.exportGlobal(Group.ANONYMOUS);

        reply.viewArgs._csrf = await reply.generateCsrf();
        return reply.view('adminPex.view.ejs', reply.viewArgs);
    }

    public async post(request: FastifyRequest, reply: FastifyReply) : Promise<any> {

        if(! request.user.admin) {
            return reply.redirect('/');
        }

        await this.pex.setGlobal(
            Group.ANONYMOUS, 
            Object.keys(request.body as {})
                .filter(k => k.startsWith('ANO_'))
                .map(k => k.replace('ANO_', ''))    
            );

        request.flash('info','permissions changed');

        reply.redirect('/admin/pex');
    }
}