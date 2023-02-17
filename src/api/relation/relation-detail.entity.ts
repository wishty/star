import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RelationType } from '../../type/relation-type';
import { Relation } from './relation.entity';

@Entity('relation_detail')
export class RelationDetail {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ name: 'relation_name' })
  @ApiProperty({ description: '관계 이름' })
  relationName: RelationType;

  @Column({ name: 'relation_id' })
  @ApiProperty({ description: '관계ID' })
  relationId: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '생성일시분초' })
  createdAt: Date;

  @ManyToOne(() => Relation, (relation) => relation.details)
  @JoinColumn({ name: 'relation_id' })
  relation: Relation;

  static of(params: Partial<RelationDetail>): RelationDetail {
    const relationDetail = new RelationDetail();
    Object.assign(relationDetail, params);

    return relationDetail;
  }

  static create(relationId: number, relationName: RelationType) {
    const relationDetail = new RelationDetail();
    relationDetail.relationId = relationId;
    relationDetail.relationName = relationName;

    return relationDetail;
  }

  update(relationId: number, relationName: RelationType): void {
    this.relationId = relationId;
    this.relationName = relationName;
  }
}
