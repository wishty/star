import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../type/category-type';
import { PointUse } from './point-use.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Point {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({
    type: 'enum',
    enum: Category,
  })
  @Column({ nullable: false })
  @ApiProperty({ description: '구분' })
  category: Category;

  @Column('int', { nullable: false })
  @ApiProperty({ description: '금액' })
  amount: number;

  @Column('varchar', { nullable: false })
  @ApiProperty({ description: '적요' })
  breakdown: string;

  @Column('date', { name: 'expiration_date', nullable: true })
  @ApiProperty({ description: '유효기간 만료일자' })
  expirationDate: string | Date;

  @Column('int', { name: 'user_id', nullable: false })
  @ApiProperty({ description: '회원ID' })
  userId: number;

  @ManyToOne(() => User, (user) => user.point)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PointUse, (pointUse) => pointUse.point, {
    eager: true,
  })
  uses?: any[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '생성일시분초' })
  public createdAt: Date;

  static of(params: Partial<Point>): Point {
    const point = new Point();
    Object.assign(point, params);

    return point;
  }

  static create(
    category: Category,
    amount: number,
    breakdown: string,
    expirationDate: string | Date,
    userId: number,
  ) {
    const point = new Point();
    point.category = category;
    point.amount = amount;
    point.breakdown = breakdown;
    point.expirationDate = expirationDate;
    point.userId = userId;

    return point;
  }

  update(
    category: Category,
    amount: number,
    breakdown: string,
    expirationDate: string | Date,
    userId: number,
  ): void {
    this.category = category;
    this.amount = amount;
    this.breakdown = breakdown;
    this.expirationDate = expirationDate;
    this.userId = userId;
  }
}
