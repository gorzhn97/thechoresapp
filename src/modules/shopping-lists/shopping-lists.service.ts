import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { HOUSEHOLD_REPOSITORY, IHouseholdRepository } from '../households/household.repository';
import { SHOPPING_LIST_REPOSITORY, IShoppingListRepository } from './shopping-list.repository';
import { CreateShoppingItemDto } from './dto/create-shopping-item.dto';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';

@Injectable()
export class ShoppingListsService {
    constructor(
        @Inject(SHOPPING_LIST_REPOSITORY)
        private readonly shoppingListRepository: IShoppingListRepository,
        @Inject(HOUSEHOLD_REPOSITORY)
        private readonly householdRepository: IHouseholdRepository,
        private readonly activityService: ActivityService,
    ) { }

    async createList(householdId: string, actorId: string, dto: CreateShoppingListDto) {
        await this.ensureHouseholdExists(householdId);

        const list = await this.shoppingListRepository.createList({
            householdId,
            title: dto.title.trim(),
            createdBy: actorId,
        });

        await this.activityService.record({
            householdId,
            actorId,
            type: 'shopping_list_created',
            entityType: 'shopping_list',
            entityId: list.id,
            metadata: { title: list.title },
        });

        return list;
    }

    async listByHousehold(householdId: string) {
        const lists = await this.shoppingListRepository.listByHousehold(householdId);
        const itemsByList = await Promise.all(
            lists.map(async (list) => ({
                listId: list.id,
                items: await this.shoppingListRepository.listItems(list.id),
            })),
        );

        return lists.map((list) => ({
            ...list,
            items: itemsByList.find((entry) => entry.listId === list.id)?.items ?? [],
        }));
    }

    async addItem(
        householdId: string,
        listId: string,
        actorId: string,
        dto: CreateShoppingItemDto,
    ) {
        const list = await this.shoppingListRepository.findListById(listId);
        if (!list || list.householdId !== householdId) {
            throw new NotFoundException({
                code: 'SHOPPING_LIST_NOT_FOUND',
                message: 'Shopping list was not found',
            });
        }

        const item = await this.shoppingListRepository.createItem({
            listId,
            name: dto.name.trim(),
            quantity: dto.quantity?.trim(),
            addedBy: actorId,
        });

        await this.activityService.record({
            householdId,
            actorId,
            type: 'item_added',
            entityType: 'shopping_item',
            entityId: item.id,
            metadata: { list_id: listId, name: item.name },
        });

        return item;
    }

    async checkItem(householdId: string, listId: string, itemId: string, actorId: string) {
        const list = await this.shoppingListRepository.findListById(listId);
        if (!list || list.householdId !== householdId) {
            throw new NotFoundException({
                code: 'SHOPPING_LIST_NOT_FOUND',
                message: 'Shopping list was not found',
            });
        }

        const item = await this.shoppingListRepository.findItemById(itemId);
        if (!item || item.listId !== listId) {
            throw new NotFoundException({
                code: 'SHOPPING_ITEM_NOT_FOUND',
                message: 'Shopping item was not found',
            });
        }

        if (item.checked) {
            throw new ConflictException({
                code: 'ITEM_ALREADY_CHECKED',
                message: 'Shopping item has already been checked',
            });
        }

        const checkedItem = await this.shoppingListRepository.markItemCheckedIfUnchecked(
            itemId,
            actorId,
            new Date(),
        );

        if (!checkedItem) {
            throw new ConflictException({
                code: 'ITEM_ALREADY_CHECKED',
                message: 'Shopping item has already been checked',
            });
        }

        await this.activityService.record({
            householdId,
            actorId,
            type: 'item_checked',
            entityType: 'shopping_item',
            entityId: itemId,
            metadata: { list_id: listId },
        });

        return checkedItem;
    }

    private async ensureHouseholdExists(householdId: string) {
        const household = await this.householdRepository.findById(householdId);
        if (!household) {
            throw new NotFoundException({
                code: 'HOUSEHOLD_NOT_FOUND',
                message: 'Household was not found',
            });
        }
    }
}