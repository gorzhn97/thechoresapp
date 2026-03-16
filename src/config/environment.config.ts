export default () => ({
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL ?? '',
    jwt: {
        secret: process.env.JWT_SECRET ?? '',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    },
    throttling: {
        authTtl: Number(process.env.THROTTLE_AUTH_TTL ?? 60),
        authLimit: Number(process.env.THROTTLE_AUTH_LIMIT ?? 5),
        generalTtl: Number(process.env.THROTTLE_GENERAL_TTL ?? 60),
        generalLimit: Number(process.env.THROTTLE_GENERAL_LIMIT ?? 30),
    },
});