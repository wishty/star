import { ApiProperty } from '@nestjs/swagger';
import { Scope } from './../../../type/scope-type';

export class PostDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '공개범위' })
  scope: Scope;

  @ApiProperty({ description: '이미지 주소' })
  imageUrl: string;

  @ApiProperty({ description: '작성자ID' })
  authorId: string;
}
