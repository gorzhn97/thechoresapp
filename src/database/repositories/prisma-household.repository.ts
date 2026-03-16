import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IHouseholdRepository } from '../../modules/households/household.repository';
import {
    CreateHouseholdInput,
    HouseholdRecord,
    HouseholdSummary,
} from '../../modules/households/households.types';

@Injectable()
export class PrismaHouseholdRepository implements IHouseholdRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateHouseholdInput): Promise<HouseholdRecord> {
        const household = await this.prisma.household.create({
            data: {
                name: input.name,
                createdBy: input.createdBy,
            },
        });

        return this.map(household);
    }

    async findById(id: string): Promise<HouseholdRecord | null> {
        const household = await this.prisma.household.findUnique({ where: { id } });
        return household ? this.map(household) : null;
    }

    async listForUser(userId: string): Promise<HouseholdSummary[]> {
        const memberships = await this.prisma.householdMember.findMany({
            where: { userId },
            include: { household: true },
            orderBy: { joinedAt: 'desc' },
        });

        return memberships.map((membership) => ({
            id: membership.household.id,
            name: membership.household.name,
            createdBy: membership.household.createdBy,
            createdAt: membership.household.createdAt,
            role: membership.role as HouseholdSummary['role'],
        }));
    }

    private map(household: {
        id: string;
        name: string;
        createdBy: string;
        createdAt: Date;
    }): HouseholdRecord {
        return {
            id: household.id,
            name: household.name,
            createdBy: household.createdBy,
            createdAt: household.createdAt,
        };
    }
}