import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/prisma/database.module';
import { PrismaChoreInstanceRepository } from '../../database/repositories/prisma-chore-instance.repository';
import { PrismaChoreTemplateRepository } from '../../database/repositories/prisma-chore-template.repository';
import { ActivityModule } from '../activity/activity.module';
import { HouseholdsModule } from '../households/households.module';
import { UsersModule } from '../users/users.module';
import { CHORE_INSTANCE_REPOSITORY } from './chore-instance.repository';
import { CHORE_TEMPLATE_REPOSITORY } from './chore-template.repository';
import { ChoresController } from './chores.controller';
import { ChoresService } from './chores.service';

@Module({
    imports: [DatabaseModule, UsersModule, HouseholdsModule, ActivityModule],
    controllers: [ChoresController],
    providers: [
        ChoresService,
        PrismaChoreTemplateRepository,
        PrismaChoreInstanceRepository,
        {
            provide: CHORE_TEMPLATE_REPOSITORY,
            useExisting: PrismaChoreTemplateRepository,
        },
        {
            provide: CHORE_INSTANCE_REPOSITORY,
            useExisting: PrismaChoreInstanceRepository,
        },
    ],
})
export class ChoresModule { }