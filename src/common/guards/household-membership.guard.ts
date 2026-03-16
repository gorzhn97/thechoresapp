import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
} from '@nestjs/common';
import { IHouseholdMemberRepository, HOUSEHOLD_MEMBER_REPOSITORY } from '../../modules/households/household-member.repository';
import { AuthenticatedUser } from '../../modules/auth/auth.types';
import { HouseholdRole } from '../../modules/households/households.types';

@Injectable()
export class HouseholdMembershipGuard implements CanActivate {
    constructor(
        @Inject(HOUSEHOLD_MEMBER_REPOSITORY)
        private readonly householdMemberRepository: IHouseholdMemberRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<{
            params: { householdId?: string };
            user: AuthenticatedUser;
            householdRole?: HouseholdRole;
        }>();
        const householdId = request.params.householdId;

        if (!householdId) {
            return true;
        }

        const membership = await this.householdMemberRepository.findByHouseholdAndUser(
            householdId,
            request.user.sub,
        );

        if (!membership) {
            throw new ForbiddenException({
                code: 'HOUSEHOLD_ACCESS_DENIED',
                message: 'You do not belong to this household',
            });
        }

        request.householdRole = membership.role;
        return true;
    }
}