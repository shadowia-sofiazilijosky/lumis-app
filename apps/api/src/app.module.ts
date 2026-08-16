import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';
import { ShelvesModule } from './modules/shelves/shelves.module';
import { UsersModule } from './modules/users/users.module';
import { SupabaseStorageModule } from './storage/supabase-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] }),
    PrismaModule,
    SupabaseStorageModule,
    UsersModule,
    AuthModule,
    BooksModule,
    ShelvesModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
