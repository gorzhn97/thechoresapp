export type ShoppingListRecord = {
    id: string;
    householdId: string;
    title: string;
    createdBy: string;
    createdAt: Date;
};

export type CreateShoppingListInput = {
    householdId: string;
    title: string;
    createdBy: string;
};

export type ShoppingItemRecord = {
    id: string;
    listId: string;
    name: string;
    quantity: string | null;
    addedBy: string;
    checked: boolean;
    checkedBy: string | null;
    checkedAt: Date | null;
    position: number;
};

export type CreateShoppingItemInput = {
    listId: string;
    name: string;
    quantity?: string;
    addedBy: string;
};