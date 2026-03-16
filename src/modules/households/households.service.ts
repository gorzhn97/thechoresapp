import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DuplicateRecordError } from '../../common/errors/duplicate-record.error';
import { ActivityService } from '../activity/activity.service';
import { IUserRepository, USER_REPOSITORY } from '../users/user.repository';
import { HOUSEHOLD_MEMBER_REPOSITORY, IHouseholdMemberRepository } from './household-member.repository';
import { HOUSEHOLD_REPOSITORY, IHouseholdRepository } from './household.repository';
import { AddHouseholdMemberDto } from './dto/add-household-member.dto';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { HouseholdRole, HouseholdSummary } from './households.types';

@Injectable()
export class HouseholdsService {
    constructor(
        @Inject(HOUSEHOLD_REPOSITORY)
        private readonly householdRepository: IHouseholdRepository,
        @Inject(HOUSEHOLD_MEMBER_REPOSITORY)
        private readonly householdMemberRepository: IHouseholdMemberRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly activityService: ActivityService,
    ) { }

    async create(userId: string, dto: CreateHouseholdDto) {
        const household = await this.householdRepository.create({
            name: dto.name.trim(),
            createdBy: userId,
        });

        await this.householdMemberRepository.addMember({
            householdId: household.id,
            userId,
            role: HouseholdRole.OWNER,
        });

        await this.activityService.record({
            householdId: household.id,
            actorId: userId,
            type: 'household_created',
            entityType: 'household',
            entityId: household.id,
            metadata: { name: household.name },
        });

        return household;
    }

    async listForUser(userId: string): Promise<HouseholdSummary[]> {
        return this.householdRepository.listForUser(userId);
    }

    async addMember(householdId: string, actorId: string, dto: AddHouseholdMemberDto) {
        const household = await this.householdRepository.findById(householdId);
        if (!household) {
            throw new NotFoundException({
                code: 'HOUSEHOLD_NOT_FOUND',
                message: 'Household was not found',
            });
        }

        const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
        if (!user) {
            throw new NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User was not found',
            });
        }

        const existingMembership = await this.householdMemberRepository.findByHouseholdAndUser(
            householdId,
            user.id,
        );
        if (existingMembership) {
            throw new ConflictException({
                code: 'HOUSEHOLD_MEMBER_EXISTS',
                message: 'User already belongs to this household',
            });
        }

        let membership;

        try {
            membership = await this.householdMemberRepository.addMember({
                householdId,
                userId: user.id,
                role: dto.role,
            });
        } catch (error) {
            if (error instanceof DuplicateRecordError) {
                throw new ConflictException({
                    code: 'HOUSEHOLD_MEMBER_EXISTS',
                    message: 'User already belongs to this household',
                });
            }

            throw error;
        }

        await this.activityService.record({
            householdId,
            actorId,
            type: 'household_joined',
            entityType: 'household_member',
            entityId: membership.id,
            metadata: {
                joined_user_id: user.id,
                role: membership.role,
            },
        });

        return membership;
    }

    async listMembers(householdId: string) {
        return this.householdMemberRepository.listByHousehold(householdId);
    }
}