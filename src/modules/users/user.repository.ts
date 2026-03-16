import { CreateUserInput, UserRecord } from './users.types';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
    create(input: CreateUserInput): Promise<UserRecord>;
    findByEmail(email: string): Promise<UserRecord | null>;
    findById(id: string): Promise<UserRecord | null>;
}