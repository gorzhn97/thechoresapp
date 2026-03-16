import { Inject, Injectable } from '@nestjs/common';
import { ACTIVITY_REPOSITORY, IActivityRepository } from './activity.repository';
import { CreateActivityInput } from './activity.types';

@Injectable()
export class ActivityService {
    constructor(
        @Inject(ACTIVITY_REPOSITORY)
        private readonly activityRepository: IActivityRepository,
    ) { }

    async record(input: CreateActivityInput) {
        return this.activityRepository.create(input);
    }

    async listByHousehold(householdId: string) {
        return this.activityRepository.listByHousehold(householdId);
    }
}