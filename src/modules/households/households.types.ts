export enum HouseholdRole {
    OWNER = 'OWNER',
    MEMBER = 'MEMBER',
}

export type HouseholdRecord = {
    id: string;
    name: string;
    createdBy: string;
    createdAt: Date;
};

export type CreateHouseholdInput = {
    name: string;
    createdBy: string;
};

export type HouseholdMemberRecord = {
    id: string;
    householdId: string;
    userId: string;
    role: HouseholdRole;
    joinedAt: Date;
};

export type CreateHouseholdMemberInput = {
    householdId: string;
    userId: string;
    role: HouseholdRole;
};

export type HouseholdSummary = HouseholdRecord & {
    role: HouseholdRole;
};