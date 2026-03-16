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
import { HouseholdMembershipGuard } from '../../common/guards/household-membership.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/auth.types';
import { CompleteChoreDto } from './dto/complete-chore.dto';
import { CreateChoreInstanceDto } from './dto/create-chore-instance.dto';
import { CreateChoreTemplateDto } from './dto/create-chore-template.dto';
import { ChoresService } from './chores.service';

@Controller('households/:householdId/chores')
@UseGuards(JwtAuthGuard, HouseholdMembershipGuard)
export class ChoresController {
    constructor(private readonly choresService: ChoresService) { }

    @Get('templates')
    listTemplates(@Param('householdId', new ParseUUIDPipe()) householdId: string) {
        return this.choresService.listTemplates(householdId);
    }

    @Post('templates')
    createTemplate(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @RequestUser() user: AuthenticatedUser,
        @Body() dto: CreateChoreTemplateDto,
    ) {
        return this.choresService.createTemplate(householdId, user.sub, dto);
    }

    @Get('instances')
    listInstances(@Param('householdId', new ParseUUIDPipe()) householdId: string) {
        return this.choresService.listInstances(householdId);
    }

    @Post('instances')
    createInstance(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @RequestUser() user: AuthenticatedUser,
        @Body() dto: CreateChoreInstanceDto,
    ) {
        return this.choresService.createInstance(householdId, user.sub, dto);
    }

    @Post('instances/:choreId/complete')
    complete(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @Param('choreId', new ParseUUIDPipe()) choreId: string,
        @RequestUser() user: AuthenticatedUser,
        @Body() dto: CompleteChoreDto,
    ) {
        return this.choresService.completeChore(householdId, choreId, user.sub, dto);
    }
}