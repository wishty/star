import { Repository } from 'typeorm';
import { Relation as Relation } from '../relation.entity';
import { CustomRepository } from '../../../decorator/typeorm-ex.decorator';

@CustomRepository(Relation)
export class RelationRepository extends Repository<Relation> {}
