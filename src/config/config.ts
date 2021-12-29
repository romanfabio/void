type AppConfig = {
    port: string | number;
    loggerLevel: string;
    secret: string;
    salt: string;
    database: string;
    redis?: string;
}

export default AppConfig;