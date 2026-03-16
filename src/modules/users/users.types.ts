export type UserRecord = {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
};

export type UserProfile = {
    id: string;
    email: string;
    createdAt: Date;
};

export type CreateUserInput = {
    email: string;
    passwordHash: string;
};