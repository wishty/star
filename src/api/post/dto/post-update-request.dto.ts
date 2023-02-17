import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scope } from './../../../type/scope-type';

export class PostUpdateRequestDto {
  @IsNotEmpty({ message: '아이디(id)는 필수값입니다.' })
  @ApiProperty({ description: 'id' })
  id: number;

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
}
