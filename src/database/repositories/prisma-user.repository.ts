import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DuplicateRecordError } from '../../common/errors/duplicate-record.error';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '../../modules/users/user.repository';
import { CreateUserInput, UserRecord } from '../../modules/users/users.types';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateUserInput): Promise<UserRecord> {
        let user;

        try {
            user = await this.prisma.user.create({
                data: {
                    email: input.email,
                    passwordHash: input.passwordHash,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new DuplicateRecordError('User email already exists');
            }

            throw error;
        }

        return this.map(user);
    }

    async findByEmail(email: string): Promise<UserRecord | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.map(user) : null;
    }

    async findById(id: string): Promise<UserRecord | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.map(user) : null;
    }

    private map(user: {
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
    }): UserRecord {
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
        };
    }
}