import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';

export class UserCreateRequestDto {
  @IsNotEmpty({ message: '이메일(email)은 필수값입니다.' })
  @IsString({ message: '이메일(email)의 형식이 올바르지 않습니다.' })
  @Length(4, 100)
  @ApiProperty({ description: '이메일' })
  email: string;

  @IsNotEmpty({ message: '비밀번호(password)은 필수값입니다.' })
  @IsString({ message: '비밀번호(password)의 형식이 올바르지 않습니다.' })
  @Length(4, 100)
  @ApiProperty({ description: '비밀번호' })
  password: string;

  @IsNotEmpty({ message: '이름(username)은 필수값입니다.' })
  @IsString({ message: '이름(username)의 형식이 올바르지 않습니다.' })
  @Length(2, 50)
  @ApiProperty({ description: '이름' })
  username: string;

  toEntity(): User {
    return User.create(this.email, this.password, this.username);
  }
}
