import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isForumName } from "../utils/validator";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import VariableRepository from "data/repositories/variable.repo";
import Context from "../utils/context";

type PostBody = {
    forumName: string;
}

export class AdminGeneralController implements Controller {

    private readonly variableRepo: VariableRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.variableRepo = ctx.repos.variable;

        app.route({
            method: 'GET',
            url: '/admin/general',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this)
        });

        app.route({
            method: 'POST',
            url: '/admin/general',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                body: {
                    type: 'object',
                    required: ['forumName', '_csrf'],
                    properties: {
                        'forumName': {type: 'string', nullable: false},
                        '_csrf': { type: 'string', nullable: false }
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        
        if(! request.user.admin) {
            return reply.redirect('/');
        }

        reply.viewArgs.forumName = this.variableRepo.findByKey('FORUM NAME');

        reply.viewArgs._csrf = await reply.generateCsrf();
        return reply.view('adminGeneral.view.ejs', reply.viewArgs);
    }

    public async post(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    
        if(! request.user.admin) {
            return reply.redirect('/');
        }

        let { forumName } = request.body as PostBody;

        forumName = forumName.trim();

        const oldName = this.variableRepo.findByKey('FORUM NAME');

        if( forumName === oldName ) {
            request.flash('info', 'forum name changed');
            return reply.redirect('/admin/general');
        }

        if(! isForumName(forumName)){
            request.flash('err', 'invalid forum name');
            return reply.redirect('/admin/general');
        }

        await this.variableRepo.update('FORUM NAME', forumName, false);

        request.flash('info', 'forum name changed');

        return reply.redirect('/admin/general');
    }
}