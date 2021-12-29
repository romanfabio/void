import { FastifyReply, FastifyRequest } from "fastify";
import { } from 'fastify-flash/lib/@types/fastify';
import { GroupBit } from "../utils/pex";
import Context from "../utils/context";

declare module "fastify" {
    interface FastifyReply {
        viewArgs: {
            _title: string;
            _errors: string[];
            _infos: string[];
            _user?: string;
            _admin?: boolean;
            _forums: string[];
            _csrf?: string;
            _canRegister?: boolean;
            [key: string]: any
        }
    }
}

export default function ({repos: {variable: variableRepo, forum: forumRepo}, pex}: Context) {

    return async function (request: FastifyRequest, reply: FastifyReply) {
        const { log: logger } = request;

        reply.viewArgs = {
            _title: variableRepo.findByKey('FORUM NAME') as string,
            _errors: reply.flash('err') as string[],
            _infos: reply.flash('info') as string[],
            _forums: []
        };

        if (request.user.username) {
            reply.viewArgs._user = request.user.username;

            if (request.user.admin) {
                reply.viewArgs._admin = true;
            }
        } else {
            if(pex.isGlobalSet(request.user.group, GroupBit.REGISTER)){
                reply.viewArgs._canRegister = true;
            }
        }

        try {
            reply.viewArgs._forums = await forumRepo.names();
        } catch (err) {
            logger.error(err);
        }

    }
}