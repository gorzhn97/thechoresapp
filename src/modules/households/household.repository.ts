import { CreateHouseholdInput, HouseholdRecord, HouseholdSummary } from './households.types';

export const HOUSEHOLD_REPOSITORY = Symbol('IHouseholdRepository');

export interface IHouseholdRepository {
    create(input: CreateHouseholdInput): Promise<HouseholdRecord>;
    findById(id: string): Promise<HouseholdRecord | null>;
    listForUser(userId: string): Promise<HouseholdSummary[]>;
}