import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Environment from './config/dev';
import { join } from 'path';

import fastifyFormBody from 'fastify-formbody';
import fastifyPointOfView from 'point-of-view';
import ejs from 'ejs';
import fastifyStatic from 'fastify-static';
import fastifySecureSession from 'fastify-secure-session';
import fastifyFlash from 'fastify-flash';
import fastifyCsrf, { CookieSerializeOptions } from 'fastify-csrf';

import Context from './utils/context';
import { PexManager } from './utils/pex';

import configureModules from './modules/module';
import configureRepositories from './data/repositories/repo';


const registerPlugins = fp(async (app: FastifyInstance): Promise<void> => {
  app.register(fastifyFormBody);
  app.register(fastifyPointOfView, {
    engine: { ejs },
    root: join(__dirname, 'views'),
    layout: 'layouts/default.view.ejs'
  });
  app.register(fastifyStatic, {
    root: join(__dirname, 'public'),
    prefix: '/public/'
  });
  app.register(fastifySecureSession as any, {
    secret: Environment.secret,
    salt: Environment.salt,
    cookieName: '__Host-Session',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    } as CookieSerializeOptions
  });
  app.register(fastifyFlash);
  app.register(fastifyCsrf, { sessionPlugin: 'fastify-secure-session' });
});



const loadApp: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const ctx: Context = {
    env: Environment
  } as Context;

  await fastify.register(registerPlugins);

  ctx.repos = await configureRepositories(fastify, ctx);
  ctx.pex = new PexManager(ctx.repos.group);

  await fastify.register(configureModules(ctx));

  console.log(fastify.printRoutes());
};

export default loadApp;