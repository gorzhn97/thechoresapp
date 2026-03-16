import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/environment.config';
import { createThrottleConfig } from './common/rate-limiter/throttle.config';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { DatabaseModule } from './database/prisma/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HouseholdsModule } from './modules/households/households.module';
import { ChoresModule } from './modules/chores/chores.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { ActivityModule } from './modules/activity/activity.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            cache: true,
        }),
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: createThrottleConfig,
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        HouseholdsModule,
        ChoresModule,
        ShoppingListsModule,
        ActivityModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestContextInterceptor,
        },
    ],
})
export class AppModule { }