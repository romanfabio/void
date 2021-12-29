import { FastifyReply, FastifyRequest } from "fastify";
import pex, { Group } from "../utils/pex";
import Context from "../utils/context";

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            username?: string;
            group: Group;
            admin?: boolean;
        }
    }
}

export default function authHook({repos:{user: userRepo}}: Context) {

    return async function (request: FastifyRequest, reply: FastifyReply) {
        const { log: logger, server } = request;
        const session = request.session.get('user') as string;

        request.user = {
            group: Group.ANONYMOUS
        };

        if (session) {
            try {

                const user = await userRepo.findByUsername(session);

                if (user) {
                    request.user.group = user.group;
                    request.user.username = session;

                    if (user.group === Group.ADMIN) {
                        request.user.admin = true;
                    }
                } else {
                    request.session.delete();
                }
            } catch (err) {
                logger.error(err);
            }
        }
    }
}