import {
    CreateShoppingItemInput,
    CreateShoppingListInput,
    ShoppingItemRecord,
    ShoppingListRecord,
} from './shopping-lists.types';

export const SHOPPING_LIST_REPOSITORY = Symbol('IShoppingListRepository');

export interface IShoppingListRepository {
    createList(input: CreateShoppingListInput): Promise<ShoppingListRecord>;
    findListById(id: string): Promise<ShoppingListRecord | null>;
    listByHousehold(householdId: string): Promise<ShoppingListRecord[]>;
    createItem(input: CreateShoppingItemInput): Promise<ShoppingItemRecord>;
    findItemById(id: string): Promise<ShoppingItemRecord | null>;
    listItems(listId: string): Promise<ShoppingItemRecord[]>;
    markItemCheckedIfUnchecked(
        itemId: string,
        checkedBy: string,
        checkedAt: Date,
    ): Promise<ShoppingItemRecord | null>;
}