import { ActivityRecord, CreateActivityInput } from './activity.types';

export const ACTIVITY_REPOSITORY = Symbol('IActivityRepository');

export interface IActivityRepository {
    create(input: CreateActivityInput): Promise<ActivityRecord>;
    listByHousehold(householdId: string): Promise<ActivityRecord[]>;
}