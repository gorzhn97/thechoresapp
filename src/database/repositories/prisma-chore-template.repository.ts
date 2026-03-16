import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IChoreTemplateRepository } from '../../modules/chores/chore-template.repository';
import {
    ChoreTemplateRecord,
    CreateChoreTemplateInput,
} from '../../modules/chores/chores.types';

@Injectable()
export class PrismaChoreTemplateRepository implements IChoreTemplateRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateChoreTemplateInput): Promise<ChoreTemplateRecord> {
        const template = await this.prisma.choreTemplate.create({
            data: {
                householdId: input.householdId,
                title: input.title,
                description: input.description,
                estimatedMinutes: input.estimatedMinutes,
                recurrenceRule: input.recurrenceRule,
            },
        });

        return this.map(template);
    }

    async findById(id: string): Promise<ChoreTemplateRecord | null> {
        const template = await this.prisma.choreTemplate.findUnique({ where: { id } });
        return template ? this.map(template) : null;
    }

    async listByHousehold(householdId: string): Promise<ChoreTemplateRecord[]> {
        const templates = await this.prisma.choreTemplate.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
        });

        return templates.map((template) => this.map(template));
    }

    private map(template: {
        id: string;
        householdId: string;
        title: string;
        description: string | null;
        estimatedMinutes: number | null;
        recurrenceRule: string | null;
        createdAt: Date;
    }): ChoreTemplateRecord {
        return {
            id: template.id,
            householdId: template.householdId,
            title: template.title,
            description: template.description,
            estimatedMinutes: template.estimatedMinutes,
            recurrenceRule: template.recurrenceRule,
            createdAt: template.createdAt,
        };
    }
}