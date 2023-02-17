import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../post.entity';
import { Scope } from './../../../type/scope-type';

export class PostCreateRequestDto {
  @IsNotEmpty({ message: '제목(title)은 필수값입니다.' })
  @IsString({ message: '제목(title)의 형식이 올바르지 않습니다.' })
  @Length(1, 100)
  @ApiProperty({ description: '제목' })
  title: string;

  @IsNotEmpty({ message: '내용(content)은 필수값입니다.' })
  @IsString({ message: '내용(content)의 형식이 올바르지 않습니다.' })
  @ApiProperty({ description: '내용' })
  content: string;

  @IsNotEmpty({ message: '공개범위(scope)은 필수값입니다.' })
  @IsString({ message: '공개범위(scope)의 형식이 올바르지 않습니다.' })
  @Length(1, 100)
  @ApiProperty({ description: '공개범위' })
  scope: Scope;

  @ApiProperty({ description: '이미지 주소' })
  imageUrl: string;

  @IsNotEmpty({ message: '작성자ID(authorId)은 필수값입니다.' })
  @IsNumber()
  @ApiProperty({ description: '작성자ID' })
  authorId: number;

  toEntity(): PostEntity {
    return PostEntity.create(
      this.title,
      this.content,
      this.scope,
      this.imageUrl,
      this.authorId,
    );
  }
}
