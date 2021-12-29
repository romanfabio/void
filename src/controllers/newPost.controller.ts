import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isPostDescription, isPostTitle } from "../utils/validator";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import PostRepository from "../data/repositories/post.repo";
import ForumRepository from "../data/repositories/forum.repo";
import Context from "../utils/context";

type GetQuery = {
    f: string;
}

type PostBody = {
    title: string;
    description: string;
}

export class NewPostController implements Controller {

    private readonly postRepo: PostRepository;
    private readonly forumRepo: ForumRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.postRepo = ctx.repos.post;
        this.forumRepo = ctx.repos.forum;

        app.route({
            method: 'GET',
            url: '/p',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this),
            schema: {
                querystring: {
                    type: 'object',
                    required: ['f'],
                    properties: {
                        f: {type: 'string', nullable: false}
                    }
                }
            }
        });

        app.route({
            method: 'POST',
            url: '/p',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                querystring: {
                    type: 'object',
                    required: ['f'],
                    properties: {
                        f: {type: 'string', nullable: false}
                    }
                },
                body: {
                    type: 'object',
                    required: ['title','description','_csrf'],
                    properties: {
                        title: {type: 'string', nullable: false},
                        description: {type: 'string', nullable: false},
                        _csrf: {type: 'string', nullable: false}
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {

        if(!request.user.username) {
            return reply.redirect('/');
        }

        const {f} = request.query as GetQuery;

        if(!reply.viewArgs._forums.includes(f)) {
            return reply.redirect('/');
        }
        
        reply.viewArgs.forumName = f;
        reply.viewArgs._csrf = await reply.generateCsrf();
        return reply.view('newPost.view.ejs', reply.viewArgs);
    }

    public async post(request: FastifyRequest, reply: FastifyReply): Promise<any> {

        if(!request.user.username) {
            return reply.redirect('/');
        }

        const {f} = request.query as GetQuery;

        if(! (await this.forumRepo.names()).includes(f)) {
            return reply.redirect('/');
        }

        let {title, description} = request.body as PostBody;

        title = title.trim();
        description = description.trim();

        if(! isPostTitle(title)) {
            request.flash('err', 'invalid title');
            return reply.redirect('/p?f=' + f);
        }

        if(! isPostDescription(description)) {
            request.flash('err', 'invalid description');
            return reply.redirect('/p?f=' + f);
        }

        const {log: logger, server} = request;

        await this.postRepo.insert({
            title, description, creator: request.user.username, forumName: f
        });

        request.flash('info', 'post created');

        reply.redirect('/f/' + f);
    }
}