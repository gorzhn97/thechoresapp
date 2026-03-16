import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DuplicateRecordError } from '../../common/errors/duplicate-record.error';
import { PrismaService } from '../prisma/prisma.service';
import { IHouseholdMemberRepository } from '../../modules/households/household-member.repository';
import {
    CreateHouseholdMemberInput,
    HouseholdMemberRecord,
    HouseholdRole,
} from '../../modules/households/households.types';

@Injectable()
export class PrismaHouseholdMemberRepository implements IHouseholdMemberRepository {
    constructor(private readonly prisma: PrismaService) { }

    async addMember(input: CreateHouseholdMemberInput): Promise<HouseholdMemberRecord> {
        let membership;

        try {
            membership = await this.prisma.householdMember.create({
                data: {
                    householdId: input.householdId,
                    userId: input.userId,
                    role: input.role,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new DuplicateRecordError('Household member already exists');
            }

            throw error;
        }

        return this.map(membership);
    }

    async findByHouseholdAndUser(
        householdId: string,
        userId: string,
    ): Promise<HouseholdMemberRecord | null> {
        const membership = await this.prisma.householdMember.findFirst({
            where: { householdId, userId },
        });

        return membership ? this.map(membership) : null;
    }

    async listByHousehold(householdId: string): Promise<HouseholdMemberRecord[]> {
        const memberships = await this.prisma.householdMember.findMany({
            where: { householdId },
            orderBy: { joinedAt: 'asc' },
        });

        return memberships.map((membership) => this.map(membership));
    }

    private map(membership: {
        id: string;
        householdId: string;
        userId: string;
        role: string;
        joinedAt: Date;
    }): HouseholdMemberRecord {
        return {
            id: membership.id,
            householdId: membership.householdId,
            userId: membership.userId,
            role: membership.role as HouseholdRole,
            joinedAt: membership.joinedAt,
        };
    }
}