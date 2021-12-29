import { config } from 'dotenv';
import AppConfig from './config';

config();



const appConfig : AppConfig = {
  port: process.env.PORT || 3000,
  loggerLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  secret: process.env.SECRET as string,
  salt: process.env.SALT as string,
  database: process.env.DATABASE as string,
  redis: process.env.REDIS
}

export default appConfig;