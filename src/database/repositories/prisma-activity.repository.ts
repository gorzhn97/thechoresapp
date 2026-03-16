import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IActivityRepository } from '../../modules/activity/activity.repository';
import { ActivityRecord, CreateActivityInput } from '../../modules/activity/activity.types';

@Injectable()
export class PrismaActivityRepository implements IActivityRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateActivityInput): Promise<ActivityRecord> {
        const activity = await this.prisma.activityLog.create({
            data: {
                householdId: input.householdId,
                actorId: input.actorId,
                type: input.type,
                entityType: input.entityType,
                entityId: input.entityId,
                metadata: (input.metadata ?? Prisma.JsonNull) as
                    | Prisma.InputJsonValue
                    | Prisma.NullableJsonNullValueInput,
            },
        });

        return this.map(activity);
    }

    async listByHousehold(householdId: string): Promise<ActivityRecord[]> {
        const activities = await this.prisma.activityLog.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
        });

        return activities.map((activity) => this.map(activity));
    }

    private map(activity: {
        id: string;
        householdId: string;
        actorId: string;
        type: string;
        entityType: string;
        entityId: string;
        metadata: unknown;
        createdAt: Date;
    }): ActivityRecord {
        return {
            id: activity.id,
            householdId: activity.householdId,
            actorId: activity.actorId,
            type: activity.type,
            entityType: activity.entityType,
            entityId: activity.entityId,
            metadata: (activity.metadata as Record<string, unknown> | null) ?? null,
            createdAt: activity.createdAt,
        };
    }
}