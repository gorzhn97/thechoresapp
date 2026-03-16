import { ChoreInstanceRecord, CreateChoreInstanceInput } from './chores.types';

export const CHORE_INSTANCE_REPOSITORY = Symbol('IChoreInstanceRepository');

export interface IChoreInstanceRepository {
    create(input: CreateChoreInstanceInput): Promise<ChoreInstanceRecord>;
    findById(id: string): Promise<ChoreInstanceRecord | null>;
    listByHousehold(householdId: string): Promise<ChoreInstanceRecord[]>;
    completeIfPending(
        choreId: string,
        version: number,
        completedBy: string,
        completedAt: Date,
    ): Promise<boolean>;
}