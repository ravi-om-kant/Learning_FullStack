import dotenv from 'dotenv'

dotenv.config();


function checkRequiredEnvVariable(key: string): string{
    const value = process.env[key];
    if(!value) throw new Error(`Missing env variable for ${key}`);
    return value;
}


export const env = {
    port: Number(process.env.PORT ?? 4001),
    isProduction: (process.env.NODE_ENV ?? "development") == "production",
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel: process.env.LOG_LEVEL ?? "info",
    databaseUrl: checkRequiredEnvVariable("DATABASE_URL"),
    jwtAccessSecret: checkRequiredEnvVariable("JWT_SECRET"),
    jwtAccessExpiresIn: checkRequiredEnvVariable("JWT_ACCESS_EXPIRES_IN"),
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
    upstashRedisUrl: checkRequiredEnvVariable("UPSTASH_REDIS_REST_URL"),
    upstashRedisToken: checkRequiredEnvVariable("UPSTASH_REDIS_REST_TOKEN"),
    redisUrl: checkRequiredEnvVariable("REDIS_URL"),

} as const;

