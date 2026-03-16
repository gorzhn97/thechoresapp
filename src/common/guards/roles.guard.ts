import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HouseholdRole } from '../../modules/households/households.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<HouseholdRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!roles || roles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<{ householdRole?: HouseholdRole }>();
        if (!request.householdRole || !roles.includes(request.householdRole)) {
            throw new ForbiddenException({
                code: 'INSUFFICIENT_ROLE',
                message: 'You do not have permission to perform this action',
            });
        }

        return true;
    }
}