import {
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DuplicateRecordError } from '../../common/errors/duplicate-record.error';
import { USER_REPOSITORY, IUserRepository } from '../users/user.repository';
import { AuthTokenResponse, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthTokenResponse> {
        const email = dto.email.trim().toLowerCase();
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new ConflictException({
                code: 'EMAIL_ALREADY_IN_USE',
                message: 'A user with this email already exists',
            });
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);
        let user;

        try {
            user = await this.userRepository.create({
                email,
                passwordHash,
            });
        } catch (error) {
            if (error instanceof DuplicateRecordError) {
                throw new ConflictException({
                    code: 'EMAIL_ALREADY_IN_USE',
                    message: 'A user with this email already exists',
                });
            }

            throw error;
        }

        return this.signToken({ sub: user.id, email: user.email });
    }

    async login(dto: LoginDto): Promise<AuthTokenResponse> {
        const email = dto.email.trim().toLowerCase();
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Email or password is incorrect',
            });
        }

        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Email or password is incorrect',
            });
        }

        return this.signToken({ sub: user.id, email: user.email });
    }

    private async signToken(payload: JwtPayload): Promise<AuthTokenResponse> {
        const expiresIn = this.configService.get<string>('jwt.expiresIn', '1d');
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: expiresIn as never,
        });
        return { accessToken };
    }
}