import { Controller } from "./controller";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { isUsername, isPassword } from "../utils/validator";
import bcrypt from 'bcrypt';
import UserRepository from "../data/repositories/user.repo";
import Context from "../utils/context";

type PostBody = {
    username: string;
    password: string;
}

export class LoginController implements Controller {

    private readonly userRepo: UserRepository;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.userRepo = ctx.repos.user;

        app.route({
            method: 'GET',
            url: '/login',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this)
        });

        app.route({
            method: 'POST',
            url: '/login',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                body: {
                    type: 'object',
                    required: ['username','password','_csrf'],
                    properties: {
                        'username': {type: 'string', nullable: false},
                        'password': {type: 'string', nullable: false},
                        '_csrf': {type: 'string', nullable: false}
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        if (!request.user.group) {
            reply.viewArgs._csrf = await reply.generateCsrf();
            return reply.view('login.view.ejs', reply.viewArgs);
        } else {
            return reply.redirect('/');
        }
    }

    public async post(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        if (request.user.group) {
            return reply.redirect('/');
        }

        let { username, password } = request.body as PostBody;

        username = username.trim();
        password = password.trim();

        if (!isUsername(username) || !isPassword(password)) {
            request.flash('err', 'invalid username/password');
            return reply.redirect('/login');
        }

        const user = await this.userRepo.findByUsername(username);

        if (user) {
            if (await bcrypt.compare(password, user.password)) {

                request.session.set('user', username);

                return reply.redirect('/');
            }
        }

        request.flash('err', 'invalid username/password');
        return reply.redirect('/login');
    }


}