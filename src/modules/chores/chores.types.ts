export enum ChoreStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export type ChoreTemplateRecord = {
    id: string;
    householdId: string;
    title: string;
    description: string | null;
    estimatedMinutes: number | null;
    recurrenceRule: string | null;
    createdAt: Date;
};

export type CreateChoreTemplateInput = {
    householdId: string;
    title: string;
    description?: string;
    estimatedMinutes?: number;
    recurrenceRule?: string;
};

export type ChoreInstanceRecord = {
    id: string;
    templateId: string | null;
    householdId: string;
    assignedTo: string | null;
    status: ChoreStatus;
    dueDate: Date;
    completedAt: Date | null;
    completedBy: string | null;
    version: number;
    createdAt: Date;
};

export type CreateChoreInstanceInput = {
    templateId?: string;
    householdId: string;
    assignedTo?: string;
    dueDate: Date;
};