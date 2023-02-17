import { Module } from '@nestjs/common';
import { TypeOrmExModule } from '../../database/typeorm-ex.module';
import { RelationRepository } from './repository/relation.repository';
import { RelationController } from './relation.controller';
import { RelationService } from './relation.service';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../auth/user.service';
import { UserRepository } from '../auth/repository/user.repository';
import { AuthService } from '../auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RelationDetailRepository } from './repository/relation-detail.repository';
import { PointService } from '../point/point.service';
import { PointRepository } from '../point/point.repository';
import { PointUserepository } from '../point/point-use.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      RelationRepository,
      UserRepository,
      RelationDetailRepository,
      PointRepository,
      PointUserepository,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: `${process.env.JWT_EXPIRATION_TIME}s`,
      },
    }),
    PassportModule,
    ConfigModule,
  ],
  controllers: [RelationController],
  providers: [
    UserService,
    RelationService,
    AuthService,
    JwtService,
    PointService,
  ],
})
export class RelationModule {}
