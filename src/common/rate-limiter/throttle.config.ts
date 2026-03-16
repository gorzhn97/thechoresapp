import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const createThrottleConfig = (
    configService: ConfigService,
): ThrottlerModuleOptions => ({
    throttlers: [
        {
            name: 'default',
            ttl: configService.get<number>('throttling.generalTtl', 60) * 1000,
            limit: configService.get<number>('throttling.generalLimit', 30),
        },
    ],
});