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
import { CreateShoppingItemDto } from './dto/create-shopping-item.dto';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('households/:householdId/shopping-lists')
@UseGuards(JwtAuthGuard, HouseholdMembershipGuard)
export class ShoppingListsController {
    constructor(private readonly shoppingListsService: ShoppingListsService) { }

    @Get()
    list(@Param('householdId', new ParseUUIDPipe()) householdId: string) {
        return this.shoppingListsService.listByHousehold(householdId);
    }

    @Post()
    create(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @RequestUser() user: AuthenticatedUser,
        @Body() dto: CreateShoppingListDto,
    ) {
        return this.shoppingListsService.createList(householdId, user.sub, dto);
    }

    @Post(':listId/items')
    addItem(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @Param('listId', new ParseUUIDPipe()) listId: string,
        @RequestUser() user: AuthenticatedUser,
        @Body() dto: CreateShoppingItemDto,
    ) {
        return this.shoppingListsService.addItem(householdId, listId, user.sub, dto);
    }

    @Post(':listId/items/:itemId/check')
    checkItem(
        @Param('householdId', new ParseUUIDPipe()) householdId: string,
        @Param('listId', new ParseUUIDPipe()) listId: string,
        @Param('itemId', new ParseUUIDPipe()) itemId: string,
        @RequestUser() user: AuthenticatedUser,
    ) {
        return this.shoppingListsService.checkItem(householdId, listId, itemId, user.sub);
    }
}