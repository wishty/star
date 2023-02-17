import { Module } from '@nestjs/common';
import { TypeOrmExModule } from '../../database/typeorm-ex.module';
import { PointRepository } from './point.repository';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { PointUserepository } from './point-use.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([PointRepository, PointUserepository]),
  ],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
