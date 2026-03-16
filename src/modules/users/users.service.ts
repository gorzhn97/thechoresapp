import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from './user.repository';
import { UserProfile } from './users.types';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    async getProfile(userId: string): Promise<UserProfile> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User was not found',
            });
        }

        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
}