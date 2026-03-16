import { ChoreTemplateRecord, CreateChoreTemplateInput } from './chores.types';

export const CHORE_TEMPLATE_REPOSITORY = Symbol('IChoreTemplateRepository');

export interface IChoreTemplateRepository {
    create(input: CreateChoreTemplateInput): Promise<ChoreTemplateRecord>;
    findById(id: string): Promise<ChoreTemplateRecord | null>;
    listByHousehold(householdId: string): Promise<ChoreTemplateRecord[]>;
}