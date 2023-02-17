import { Module } from '@nestjs/common';
import { TypeOrmExModule } from '../../database/typeorm-ex.module';
import { UserRepository } from './repository/user.repository';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './../../secutity/passport.jwt.strategy';
import { PointService } from '../point/point.service';
import { PointRepository } from '../point/point.repository';
import { PointUserepository } from '../point/point-use.repository';
import { LocalStrategy } from 'src/secutity/passport.local.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      UserRepository,
      PointRepository,
      PointUserepository,
    ]),
    ConfigModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: `${process.env.JWT_EXPIRATION_TIME}s`,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PointService,
  ],
})
export class AuthModule {}
