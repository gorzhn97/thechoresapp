import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/prisma/database.module';
import { PrismaUserRepository } from '../../database/repositories/prisma-user.repository';
import { USER_REPOSITORY } from './user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        PrismaUserRepository,
        {
            provide: USER_REPOSITORY,
            useExisting: PrismaUserRepository,
        },
    ],
    exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule { }