import ForumRepository from "../data/repositories/forum.repo";
import VariableRepository from "../data/repositories/variable.repo";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import Context from "../utils/context";

type GetQuery = {
    p: number;
}

export class HomeController implements Controller {

    private readonly variableRepo : VariableRepository;
    private readonly forumRepo : ForumRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.variableRepo = ctx.repos.variable;
        this.forumRepo = ctx.repos.forum;

        app.route({
            method: 'GET',
            url: '/',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this),
            schema: {
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

        let {p: page} = request.query as GetQuery;

        const pagination = this.variableRepo.findByKey('HOME PAGINATION') as number;

        if(!page || page < 0 || page >= Math.ceil(reply.viewArgs._forums.length / pagination)) {
            page = 0;
        }

        reply.viewArgs.forums = await this.forumRepo.page(page * pagination,pagination);
    
        reply.viewArgs.page = page;
        
        reply.viewArgs.firstPage = page === 0;
        reply.viewArgs.lastPage = page >= (Math.ceil(reply.viewArgs._forums.length/pagination)-1);
    
        return reply.view('home.view.ejs', reply.viewArgs);
    }
}