import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PointAbstractDTO {
  @IsNotEmpty({ message: '금액(amount)은 필수값입니다.' })
  @IsNumber()
  @ApiProperty({ description: '금액', default: 10000 })
  amount!: number;

  @IsNotEmpty({ message: '유저ID(userId)은 필수값입니다.' })
  @IsNumber()
  @ApiProperty({ description: '유저ID', default: 1 })
  userId!: number;
}
