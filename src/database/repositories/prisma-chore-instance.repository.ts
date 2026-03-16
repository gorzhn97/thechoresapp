import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IChoreInstanceRepository } from '../../modules/chores/chore-instance.repository';
import {
    ChoreInstanceRecord,
    ChoreStatus,
    CreateChoreInstanceInput,
} from '../../modules/chores/chores.types';

@Injectable()
export class PrismaChoreInstanceRepository implements IChoreInstanceRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateChoreInstanceInput): Promise<ChoreInstanceRecord> {
        const instance = await this.prisma.choreInstance.create({
            data: {
                templateId: input.templateId,
                householdId: input.householdId,
                assignedTo: input.assignedTo,
                dueDate: input.dueDate,
            },
        });

        return this.map(instance);
    }

    async findById(id: string): Promise<ChoreInstanceRecord | null> {
        const instance = await this.prisma.choreInstance.findUnique({ where: { id } });
        return instance ? this.map(instance) : null;
    }

    async listByHousehold(householdId: string): Promise<ChoreInstanceRecord[]> {
        const instances = await this.prisma.choreInstance.findMany({
            where: { householdId },
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        });

        return instances.map((instance) => this.map(instance));
    }

    async completeIfPending(
        choreId: string,
        version: number,
        completedBy: string,
        completedAt: Date,
    ): Promise<boolean> {
        const result = await this.prisma.choreInstance.updateMany({
            where: {
                id: choreId,
                version,
                status: 'PENDING',
            },
            data: {
                status: 'COMPLETED',
                completedAt,
                completedBy,
                version: { increment: 1 },
            },
        });

        return result.count === 1;
    }

    private map(instance: {
        id: string;
        templateId: string | null;
        householdId: string;
        assignedTo: string | null;
        status: string;
        dueDate: Date;
        completedAt: Date | null;
        completedBy: string | null;
        version: number;
        createdAt: Date;
    }): ChoreInstanceRecord {
        return {
            id: instance.id,
            templateId: instance.templateId,
            householdId: instance.householdId,
            assignedTo: instance.assignedTo,
            status: instance.status as ChoreStatus,
            dueDate: instance.dueDate,
            completedAt: instance.completedAt,
            completedBy: instance.completedBy,
            version: instance.version,
            createdAt: instance.createdAt,
        };
    }
}