import {
    Body,
    Controller,
    Get,
    ParseUUIDPipe,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { HouseholdMembershipGuard } from '../../common/guards/household-membership.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/auth.types';
import { AddHouseholdMemberDto } from './dto/add-household-member.dto';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { HouseholdsService } from './households.service';
import { HouseholdRole } from './households.types';

@Controller('households')
@UseGuards(JwtAuthGuard)
export class HouseholdsController {
    constructor(private readonly householdsService: HouseholdsService) { }

    @Get()
    list(@RequestUser() user: AuthenticatedUser) {
        return this.householdsService.listForUser(user.sub);
    }

    @Post()
    create(@RequestUser() user: AuthenticatedUser, @Body() dto: CreateHouseholdDto) {
        return this.householdsService.create(user.sub, dto);
    }

    @Get(':householdId/members')
    @UseGuards(HouseholdMembershipGuard)
    listMembers(@Param('householdId', new ParseUUIDPipe()) householdId: string) {
        return this.householdsService.listMembers(householdId);
    }

    @Post(':householdId/members')
    @UseGuards(HouseholdMembershipGuard, RolesGuard)
    @Roles(HouseholdRole.OWNER)
    addMember(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @RequestUser() user: AuthenticatedUser,
        @Body() dto: AddHouseholdMemberDto,
    ) {
        return this.householdsService.addMember(householdId, user.sub, dto);
    }
}