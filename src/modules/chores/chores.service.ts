import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { HOUSEHOLD_MEMBER_REPOSITORY, IHouseholdMemberRepository } from '../households/household-member.repository';
import { HOUSEHOLD_REPOSITORY, IHouseholdRepository } from '../households/household.repository';
import { IUserRepository, USER_REPOSITORY } from '../users/user.repository';
import { CHORE_INSTANCE_REPOSITORY, IChoreInstanceRepository } from './chore-instance.repository';
import { CHORE_TEMPLATE_REPOSITORY, IChoreTemplateRepository } from './chore-template.repository';
import { CompleteChoreDto } from './dto/complete-chore.dto';
import { CreateChoreInstanceDto } from './dto/create-chore-instance.dto';
import { CreateChoreTemplateDto } from './dto/create-chore-template.dto';
import { ChoreStatus } from './chores.types';

@Injectable()
export class ChoresService {
    constructor(
        @Inject(CHORE_TEMPLATE_REPOSITORY)
        private readonly choreTemplateRepository: IChoreTemplateRepository,
        @Inject(CHORE_INSTANCE_REPOSITORY)
        private readonly choreInstanceRepository: IChoreInstanceRepository,
        @Inject(HOUSEHOLD_REPOSITORY)
        private readonly householdRepository: IHouseholdRepository,
        @Inject(HOUSEHOLD_MEMBER_REPOSITORY)
        private readonly householdMemberRepository: IHouseholdMemberRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly activityService: ActivityService,
    ) { }

    async createTemplate(householdId: string, actorId: string, dto: CreateChoreTemplateDto) {
        await this.ensureHouseholdExists(householdId);

        const template = await this.choreTemplateRepository.create({
            householdId,
            title: dto.title.trim(),
            description: dto.description?.trim(),
            estimatedMinutes: dto.estimatedMinutes,
            recurrenceRule: dto.recurrenceRule?.trim(),
        });

        await this.activityService.record({
            householdId,
            actorId,
            type: 'chore_template_created',
            entityType: 'chore_template',
            entityId: template.id,
            metadata: { title: template.title, recurrence_rule: template.recurrenceRule },
        });

        return template;
    }

    async listTemplates(householdId: string) {
        return this.choreTemplateRepository.listByHousehold(householdId);
    }

    async createInstance(householdId: string, actorId: string, dto: CreateChoreInstanceDto) {
        await this.ensureHouseholdExists(householdId);

        if (dto.templateId) {
            const template = await this.choreTemplateRepository.findById(dto.templateId);
            if (!template || template.householdId !== householdId) {
                throw new NotFoundException({
                    code: 'CHORE_TEMPLATE_NOT_FOUND',
                    message: 'Chore template was not found',
                });
            }
        }

        if (dto.assignedTo) {
            const user = await this.userRepository.findById(dto.assignedTo);
            if (!user) {
                throw new NotFoundException({
                    code: 'ASSIGNEE_NOT_FOUND',
                    message: 'Assigned user was not found',
                });
            }

            const membership = await this.householdMemberRepository.findByHouseholdAndUser(
                householdId,
                dto.assignedTo,
            );
            if (!membership) {
                throw new ConflictException({
                    code: 'ASSIGNEE_NOT_IN_HOUSEHOLD',
                    message: 'Assigned user does not belong to this household',
                });
            }
        }

        const chore = await this.choreInstanceRepository.create({
            templateId: dto.templateId,
            householdId,
            assignedTo: dto.assignedTo,
            dueDate: new Date(dto.dueDate),
        });

        await this.activityService.record({
            householdId,
            actorId,
            type: 'chore_created',
            entityType: 'chore_instance',
            entityId: chore.id,
            metadata: {
                assigned_to: chore.assignedTo,
                due_date: chore.dueDate.toISOString(),
            },
        });

        return chore;
    }

    async listInstances(householdId: string) {
        return this.choreInstanceRepository.listByHousehold(householdId);
    }

    async completeChore(
        householdId: string,
        choreId: string,
        actorId: string,
        dto: CompleteChoreDto,
    ) {
        const chore = await this.choreInstanceRepository.findById(choreId);
        if (!chore || chore.householdId !== householdId) {
            throw new NotFoundException({
                code: 'CHORE_NOT_FOUND',
                message: 'Chore was not found',
            });
        }

        if (chore.status !== ChoreStatus.PENDING) {
            throw new ConflictException({
                code: 'CHORE_ALREADY_COMPLETED',
                message: 'Chore has already been completed',
            });
        }

        const completedAt = new Date();
        const updated = await this.choreInstanceRepository.completeIfPending(
            choreId,
            dto.version,
            actorId,
            completedAt,
        );

        if (!updated) {
            const latest = await this.choreInstanceRepository.findById(choreId);
            if (latest && latest.status !== ChoreStatus.PENDING) {
                throw new ConflictException({
                    code: 'CHORE_ALREADY_COMPLETED',
                    message: 'Chore has already been completed',
                });
            }

            throw new ConflictException({
                code: 'CHORE_VERSION_CONFLICT',
                message: 'Chore update conflicted with a newer version',
            });
        }

        await this.activityService.record({
            householdId,
            actorId,
            type: 'chore_completed',
            entityType: 'chore_instance',
            entityId: choreId,
            metadata: { completed_at: completedAt.toISOString() },
        });

        return this.choreInstanceRepository.findById(choreId);
    }

    private async ensureHouseholdExists(householdId: string) {
        const household = await this.householdRepository.findById(householdId);
        if (!household) {
            throw new NotFoundException({
                code: 'HOUSEHOLD_NOT_FOUND',
                message: 'Household was not found',
            });
        }
    }
}