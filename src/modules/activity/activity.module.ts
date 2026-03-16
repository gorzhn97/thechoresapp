import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/prisma/database.module';
import { PrismaActivityRepository } from '../../database/repositories/prisma-activity.repository';
import { ACTIVITY_REPOSITORY } from './activity.repository';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { HouseholdsModule } from '../households/households.module';

@Module({
    imports: [DatabaseModule, forwardRef(() => HouseholdsModule)],
    controllers: [ActivityController],
    providers: [
        ActivityService,
        PrismaActivityRepository,
        {
            provide: ACTIVITY_REPOSITORY,
            useExisting: PrismaActivityRepository,
        },
    ],
    exports: [ActivityService, ACTIVITY_REPOSITORY],
})
export class ActivityModule { }