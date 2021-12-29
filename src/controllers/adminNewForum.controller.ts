import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isForumName, isForumDescription } from "../utils/validator";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import ForumRepository from "../data/repositories/forum.repo";
import Context from "../utils/context";

type PostBody = {
    name: string;
    description: string;
    starred: string | undefined;
}

export class AdminNewForumController implements Controller {

    private readonly forumRepo: ForumRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.forumRepo = ctx.repos.forum;


        app.route({
            method: 'GET',
            url: '/admin/newforum',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this)
        });

        app.route({
            method: 'POST',
            url: '/admin/newforum',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                body: {
                    type: 'object',
                    required: ['name','description','_csrf'],
                    properties: {
                        name: {type: 'string', nullable: false},
                        description: {type: 'string', nullable: false},
                        starred: {type: 'string', nullable: false},
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
        return reply.view('adminNewForum.view.ejs', reply.viewArgs);
    }

    public async post(request: FastifyRequest, reply: FastifyReply): Promise<any> {

        if(!request.user.admin) {
            return reply.redirect('/');
        }

        let { name, description } = request.body as PostBody;

        name = name.trim();
        description = description.trim();

        const starred = (request.body as PostBody).starred !== undefined;

        if(! isForumName(name)) {
            request.flash('err', 'invalid name');
            return reply.redirect('/admin/newforum');
        }

        if(! isForumDescription(description)) {
            request.flash('err', 'invalid description');
            return reply.redirect('/admin/newforum');
        }

        const {log: logger, server} = request;

        try {
            await this.forumRepo.insert({
                name,
                description,
                creator: request.user.username as string,
                userMask: '',
                moderatorMask: '',
                starred
            });

            request.flash('info', 'forum created');

            reply.redirect('/admin/forum');
        } catch(err: any) {

            if(err.code == '23505') {
                logger.error(err);
                request.flash('err','forum already exists');
                reply.redirect('/admin/newforum');
            } else {
                throw err;
            }
        }
    }
}