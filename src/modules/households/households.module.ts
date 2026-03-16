import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/prisma/database.module';
import { PrismaHouseholdMemberRepository } from '../../database/repositories/prisma-household-member.repository';
import { PrismaHouseholdRepository } from '../../database/repositories/prisma-household.repository';
import { HouseholdMembershipGuard } from '../../common/guards/household-membership.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActivityModule } from '../activity/activity.module';
import { UsersModule } from '../users/users.module';
import { HOUSEHOLD_MEMBER_REPOSITORY } from './household-member.repository';
import { HOUSEHOLD_REPOSITORY } from './household.repository';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';

@Module({
    imports: [DatabaseModule, UsersModule, forwardRef(() => ActivityModule)],
    controllers: [HouseholdsController],
    providers: [
        HouseholdsService,
        HouseholdMembershipGuard,
        RolesGuard,
        PrismaHouseholdRepository,
        PrismaHouseholdMemberRepository,
        {
            provide: HOUSEHOLD_REPOSITORY,
            useExisting: PrismaHouseholdRepository,
        },
        {
            provide: HOUSEHOLD_MEMBER_REPOSITORY,
            useExisting: PrismaHouseholdMemberRepository,
        },
    ],
    exports: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY, HouseholdMembershipGuard],
})
export class HouseholdsModule { }