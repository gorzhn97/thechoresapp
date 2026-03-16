import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/prisma/database.module';
import { PrismaShoppingListRepository } from '../../database/repositories/prisma-shopping-list.repository';
import { ActivityModule } from '../activity/activity.module';
import { HouseholdsModule } from '../households/households.module';
import { SHOPPING_LIST_REPOSITORY } from './shopping-list.repository';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListsService } from './shopping-lists.service';

@Module({
    imports: [DatabaseModule, ActivityModule, HouseholdsModule],
    controllers: [ShoppingListsController],
    providers: [
        ShoppingListsService,
        PrismaShoppingListRepository,
        {
            provide: SHOPPING_LIST_REPOSITORY,
            useExisting: PrismaShoppingListRepository,
        },
    ],
})
export class ShoppingListsModule { }