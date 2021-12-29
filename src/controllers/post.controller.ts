import PostRepository from "../data/repositories/post.repo";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import Context from "../utils/context";

type GetQuery = {
    p: number;
}

type GetParams = {
    id: number;
}

export class PostController implements Controller {

    private readonly postRepo: PostRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.postRepo = ctx.repos.post;
        
        app.route({
            method: 'GET',
            url: '/p/:id',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this),
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        name: {type: 'integer', nullable: false}
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

        const {id} = request.params as GetParams;

        const post = await this.postRepo.findById(id);

        if(!post) {
            return reply.callNotFound();
        }

        reply.viewArgs.post = post;
        return reply.view('post.view.ejs', reply.viewArgs);
    }
}