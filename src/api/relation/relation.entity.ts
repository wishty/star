import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RelationType } from '../../type/relation-type';
import { User } from '../auth/user.entity';
import { RelationDetail } from './relation-detail.entity';

@Entity('relation')
export class Relation {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: '유저ID' })
  userId: number;

  @Column({ name: 'friend_id' })
  @ApiProperty({ description: '친구ID' })
  friendId: number;

  @Column({ name: 'relation_name' })
  @ApiProperty({ description: '관계 이름' })
  relationName: RelationType;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '생성일시분초' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: '수정일시분초' })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @ApiProperty({ description: '삭제일시분초' })
  public deletedAt: Date;

  @OneToMany(
    () => RelationDetail,
    (relationDetail) => relationDetail.relation,
    {
      eager: true,
    },
  )
  details?: any[];

  @ManyToOne(() => User, (user) => user.relations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  static of(params: Partial<Relation>): Relation {
    const relation = new Relation();
    Object.assign(Relation, params);

    return relation;
  }

  static create(userId: number, friendId: number, relationName: RelationType) {
    const relation = new Relation();
    relation.userId = userId;
    relation.friendId = friendId;
    relation.relationName = relationName;

    return relation;
  }

  update(relationName: RelationType): void {
    this.relationName = relationName;
  }

  delete(): void {
    this.deletedAt = new Date();
  }
}
