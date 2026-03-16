import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    me(@RequestUser() user: AuthenticatedUser) {
        return this.usersService.getProfile(user.sub);
    }
}