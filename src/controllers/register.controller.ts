import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isUsername, isPassword } from "../utils/validator";
import authHook from "../hooks/auth.hook";
import viewHook from "../hooks/view.hook";
import { Controller } from "./controller";
import bcrypt from 'bcrypt';
import {Group, GroupBit, PexManager} from "../utils/pex";
import UserRepository from "../data/repositories/user.repo";
import Context from "../utils/context";

type PostBody = {
    username: string;
    password: string;
    confirm_pwd: string;
    email: string;
}

export class RegisterController implements Controller {

    private readonly userRepo: UserRepository;
    private readonly pex: PexManager;

    public constructor(app: FastifyInstance, ctx: Context) {
        this.userRepo = ctx.repos.user;
        this.pex = ctx.pex;

        app.route({
            method: 'GET',
            url: '/register',
            preHandler: [authHook(ctx), viewHook(ctx)],
            handler: this.get.bind(this)
        });

        app.route({
            method: 'POST',
            url: '/register',
            preHandler: [app.csrfProtection, authHook(ctx)],
            handler: this.post.bind(this),
            schema: {
                body: {
                    type: 'object',
                    required: ['username', 'password', 'confirm_pwd', 'email', '_csrf'],
                    properties: {
                        'username': { type: 'string', nullable: false },
                        'password': { type: 'string', nullable: false },
                        'confirm_pwd': { type: 'string', nullable: false },
                        'email': { type: 'string', nullable: false },
                        '_csrf': { type: 'string', nullable: false }
                    }
                }
            }
        });
    }

    public async get(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        const {group} = request.user;
        if (group === Group.ANONYMOUS && this.pex.isGlobalSet(group,GroupBit.REGISTER)) {
            reply.viewArgs._csrf = await reply.generateCsrf();
            return reply.view('register.view.ejs', reply.viewArgs);
        } else {
            return reply.redirect('/');
        }
    }

    public async post(request: FastifyRequest, reply: FastifyReply): Promise<any> {
        const {group} = request.user;
        if (group !== Group.ANONYMOUS || !this.pex.isGlobalSet(group, GroupBit.REGISTER)) {
            return reply.redirect('/');
        }

        let { username, password, confirm_pwd, email } = request.body as PostBody;

        username = username.trim();
        password = password.trim();
        confirm_pwd = confirm_pwd.trim();
        email = email.trim();

        if (!isUsername(username)) {
            request.flash('err', 'invalid username');
            return reply.redirect('/register');
        }

        if (password !== confirm_pwd) {
            request.flash('err', 'passwords don\'t match');
            return reply.redirect('/register');
        }

        if (!isPassword(password)) {
            request.flash('err', 'invalid password');
            return reply.redirect('/register');
        }

        // TODO validate email address

        const hash = await bcrypt.hash(password, 10);

        const {log: logger} = request;

        try {
            await this.userRepo.insert({
                username,
                password: hash,
                email,
                group: Group.USER
            });

            request.flash('info','registration completed');

            reply.redirect('/login');
        } catch(err: any) {

            if(err.code == '23505') {
                logger.error(err);
                request.flash('err','user already exists');
                reply.redirect('/register');
            } else {
                throw err;
            }
        }
    }
}