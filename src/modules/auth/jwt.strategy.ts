import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('jwt.secret') ?? 'dev-secret';

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    validate(payload: JwtPayload): JwtPayload {
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException({
                code: 'INVALID_TOKEN',
                message: 'Token payload is invalid',
            });
        }

        return payload;
    }
}