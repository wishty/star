import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MySQLModule } from './database/mysql.module';
import { HealthModule } from './api/health/health.module';
import { PointModule } from './api/point/point.module';
import { AllExceptionFilter } from './filter/all-exception.filter';
import { NotFoundExceptionFilter } from './filter/not-found-exception.filter';
import { AuthModule } from './api/auth/auth.module';
import { PostModule } from './api/post/post.module';
import { RelationModule } from './api/relation/relation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MySQLModule,
    HealthModule,
    AuthModule,
    PostModule,
    RelationModule,
    PointModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
  ],
})
export class AppModule {}
