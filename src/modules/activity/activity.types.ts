export type ActivityRecord = {
    id: string;
    householdId: string;
    actorId: string;
    type: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
};

export type CreateActivityInput = {
    householdId: string;
    actorId: string;
    type: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown> | null;
};