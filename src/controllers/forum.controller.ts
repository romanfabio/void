import PostRepository from "../data/repositories/post.repo";
import VariableRepository from "../data/repositories/variable.repo";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import Context from "../utils/context";

type GetQuery = {
    p: number;
}

type GetParams = {
    name: string;
}

export class ForumController implements Controller {

    private readonly variableRepo: VariableRepository;
    private readonly postRepo: PostRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.variableRepo = ctx.repos.variable;
        this.postRepo = ctx.repos.post;

        
        app.route({
            method: 'GET',
            url: '/f/:name',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this),
            schema: {
                params: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {type: 'string', nullable: false}
                    }
                },
                querystring: {
                    type: 'object',
                    properties: {
                        p: {type: 'integer', nullable: false}
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        
        const {server} = request;

        const {name} = request.params as GetParams;

        if(! reply.viewArgs._forums.includes(name)) {
            return reply.callNotFound();
        }
        
        reply.viewArgs.forumName = name;

        const postCount = await this.postRepo.countByForumName(name);

        let {p: page} = request.query as GetQuery;

        const pagination = this.variableRepo.findByKey('FORUM PAGINATION') as number;

        if(!page || page < 0 || page >= Math.ceil(postCount / pagination)) {
            page = 0;
        }

        reply.viewArgs.posts = await this.postRepo.page(page * pagination,pagination, name);
    
        reply.viewArgs.page = page;
        
        reply.viewArgs.firstPage = page === 0;
        reply.viewArgs.lastPage = page >= (Math.ceil(postCount/pagination)-1);

        return reply.view('forum.view.ejs', reply.viewArgs);

    }
}