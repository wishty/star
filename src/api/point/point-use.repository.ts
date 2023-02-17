import { Repository } from 'typeorm';
import { CustomRepository } from '../../decorator/typeorm-ex.decorator';
import { PointUse } from './point-use.entity';

@CustomRepository(PointUse)
export class PointUserepository extends Repository<PointUse> {}
