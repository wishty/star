import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateRequestDto {
  @IsNotEmpty({ message: '아이디(id)는 필수값입니다.' })
  @IsNumber()
  id: number;

  @IsNotEmpty({ message: '비밀번호(password)는 필수값입니다.' })
  @IsString({ message: '비밀번호(password)의 형식이 올바르지 않습니다.' })
  @Length(4, 100)
  @ApiProperty({ description: '비밀번호' })
  password: string;
}
