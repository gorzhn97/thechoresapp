import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IShoppingListRepository } from '../../modules/shopping-lists/shopping-list.repository';
import {
    CreateShoppingItemInput,
    CreateShoppingListInput,
    ShoppingItemRecord,
    ShoppingListRecord,
} from '../../modules/shopping-lists/shopping-lists.types';

@Injectable()
export class PrismaShoppingListRepository implements IShoppingListRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createList(input: CreateShoppingListInput): Promise<ShoppingListRecord> {
        const list = await this.prisma.shoppingList.create({
            data: {
                householdId: input.householdId,
                title: input.title,
                createdBy: input.createdBy,
            },
        });

        return this.mapList(list);
    }

    async findListById(id: string): Promise<ShoppingListRecord | null> {
        const list = await this.prisma.shoppingList.findUnique({ where: { id } });
        return list ? this.mapList(list) : null;
    }

    async listByHousehold(householdId: string): Promise<ShoppingListRecord[]> {
        const lists = await this.prisma.shoppingList.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
        });

        return lists.map((list) => this.mapList(list));
    }

    async createItem(input: CreateShoppingItemInput): Promise<ShoppingItemRecord> {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                const item = await this.prisma.$transaction(
                    async (transaction) => {
                        const lastItem = await transaction.shoppingItem.findFirst({
                            where: { listId: input.listId },
                            orderBy: { position: 'desc' },
                            select: { position: true },
                        });

                        return transaction.shoppingItem.create({
                            data: {
                                listId: input.listId,
                                name: input.name,
                                quantity: input.quantity,
                                addedBy: input.addedBy,
                                position: (lastItem?.position ?? 0) + 1,
                            },
                        });
                    },
                    {
                        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                    },
                );

                return this.mapItem(item);
            } catch (error) {
                const isRetriablePrismaError =
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    (error.code === 'P2002' || error.code === 'P2034');

                if (!isRetriablePrismaError || attempt === 2) {
                    throw error;
                }
            }
        }

        throw new Error('Failed to create shopping item after retries');
    }

    async findItemById(id: string): Promise<ShoppingItemRecord | null> {
        const item = await this.prisma.shoppingItem.findUnique({ where: { id } });
        return item ? this.mapItem(item) : null;
    }

    async listItems(listId: string): Promise<ShoppingItemRecord[]> {
        const items = await this.prisma.shoppingItem.findMany({
            where: { listId },
            orderBy: [{ checked: 'asc' }, { position: 'asc' }],
        });

        return items.map((item) => this.mapItem(item));
    }

    async markItemCheckedIfUnchecked(
        itemId: string,
        checkedBy: string,
        checkedAt: Date,
    ): Promise<ShoppingItemRecord | null> {
        const result = await this.prisma.shoppingItem.updateMany({
            where: {
                id: itemId,
                checked: false,
            },
            data: {
                checked: true,
                checkedBy,
                checkedAt,
            },
        });

        if (result.count !== 1) {
            return null;
        }

        const item = await this.prisma.shoppingItem.findUnique({ where: { id: itemId } });
        return item ? this.mapItem(item) : null;
    }

    private mapList(list: {
        id: string;
        householdId: string;
        title: string;
        createdBy: string;
        createdAt: Date;
    }): ShoppingListRecord {
        return {
            id: list.id,
            householdId: list.householdId,
            title: list.title,
            createdBy: list.createdBy,
            createdAt: list.createdAt,
        };
    }

    private mapItem(item: {
        id: string;
        listId: string;
        name: string;
        quantity: string | null;
        addedBy: string;
        checked: boolean;
        checkedBy: string | null;
        checkedAt: Date | null;
        position: number;
    }): ShoppingItemRecord {
        return {
            id: item.id,
            listId: item.listId,
            name: item.name,
            quantity: item.quantity,
            addedBy: item.addedBy,
            checked: item.checked,
            checkedBy: item.checkedBy,
            checkedAt: item.checkedAt,
            position: item.position,
        };
    }
}