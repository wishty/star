import { Module } from '@nestjs/common';
import { TypeOrmExModule } from '../../database/typeorm-ex.module';
import { PostRepository } from './repository/post.repository';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../auth/user.service';
import { UserRepository } from '../auth/repository/user.repository';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RelationService } from '../relation/relation.service';
import { RelationRepository } from '../relation/repository/relation.repository';
import { RelationDetailRepository } from '../relation/repository/relation-detail.repository';
import { PointService } from '../point/point.service';
import { PointRepository } from '../point/point.repository';
import { PointUserepository } from '../point/point-use.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      PostRepository,
      UserRepository,
      RelationRepository,
      RelationDetailRepository,
      PointRepository,
      PointUserepository,
    ]),
    PassportModule,
  ],
  controllers: [PostController],
  providers: [
    UserService,
    PostService,
    AuthService,
    JwtService,
    RelationService,
    PointService,
    ConfigService,
  ],
})
export class PostModule {}
