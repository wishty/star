import { IsString, IsNotEmpty, Length, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveReason } from 'src/type/leave-type';

export class UserDeleteRequestDto {
  @IsNotEmpty({ message: '아이디(id)는 필수값입니다.' })
  @IsNumber()
  id: number;

  @IsNotEmpty({ message: '탈퇴사유(leave_reason)은 필수값입니다.' })
  @IsString({ message: '탈퇴사유(leave_reason)의 형식이 올바르지 않습니다.' })
  @Length(2, 50)
  @ApiProperty({ description: '탈퇴사유' })
  leave_reason: LeaveReason;

  @ApiPropertyOptional()
  @IsString({
    message: '탈퇴사유상세(leave_reason_detail)의 형식이 올바르지 않습니다.',
  })
  @Length(0, 1000)
  @ApiProperty({ description: '탈퇴사유상세' })
  leave_reason_detail: string;
}
