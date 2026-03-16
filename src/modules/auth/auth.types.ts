export type JwtPayload = {
    sub: string;
    email: string;
};

export type AuthenticatedUser = JwtPayload;

export type AuthTokenResponse = {
    accessToken: string;
};