import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { HouseholdMembershipGuard } from '../../common/guards/household-membership.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';

@Controller('households/:householdId/activity')
@UseGuards(JwtAuthGuard, HouseholdMembershipGuard)
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    list(@Param('householdId', new ParseUUIDPipe()) householdId: string) {
        return this.activityService.listByHousehold(householdId);
    }
}