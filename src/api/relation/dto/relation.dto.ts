import { ApiProperty } from '@nestjs/swagger';
import { RelationType } from '../../../type/relation-type';

export class RelationDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '유저ID' })
  userId: number;

  @ApiProperty({ description: '친구ID' })
  friendId: number;

  @ApiProperty({ description: '관계 이름' })
  relationName: RelationType;
}
