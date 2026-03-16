import { CreateHouseholdMemberInput, HouseholdMemberRecord } from './households.types';

export const HOUSEHOLD_MEMBER_REPOSITORY = Symbol('IHouseholdMemberRepository');

export interface IHouseholdMemberRepository {
    addMember(input: CreateHouseholdMemberInput): Promise<HouseholdMemberRecord>;
    findByHouseholdAndUser(
        householdId: string,
        userId: string,
    ): Promise<HouseholdMemberRecord | null>;
    listByHousehold(householdId: string): Promise<HouseholdMemberRecord[]>;
}