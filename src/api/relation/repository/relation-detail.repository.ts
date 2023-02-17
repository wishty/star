import { Repository } from 'typeorm';
import { RelationDetail } from '../relation-detail.entity';
import { CustomRepository } from '../../../decorator/typeorm-ex.decorator';

@CustomRepository(RelationDetail)
export class RelationDetailRepository extends Repository<RelationDetail> {}
