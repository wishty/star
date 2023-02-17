import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Relation } from '../relation.entity';
import { RelationType } from '../../../type/relation-type';

export class RelationDetailDto {
  @IsNotEmpty({ message: '유저ID(userId)은 필수값입니다.' })
  @IsNumber()
  @ApiProperty({ description: '유저ID' })
  userId: number;

  @IsNotEmpty({ message: '관계ID(relationId)은 필수값입니다.' })
  @IsNumber()
  @ApiProperty({ description: '관계ID' })
  relationId: number;

  @IsNotEmpty({ message: '관계 이름(relationName)은 필수값입니다.' })
  @ApiProperty({ description: '관계 이름' })
  relationName: RelationType;

  toEntity(): Relation {
    return Relation.create(this.userId, this.relationId, this.relationName);
  }
}
