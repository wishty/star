import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from './../post/post.entity';
import { Relation } from './../relation/relation.entity';
import { Point } from '../point/point.entity';
import { LeaveReason } from 'src/type/leave-type';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ length: 100, unique: true })
  @ApiProperty({ description: '이메일' })
  email: string;

  @Column({ length: 100 })
  @ApiProperty({ description: '비밀번호' })
  password: string;

  @Column({ length: 50 })
  @ApiProperty({ description: '이름' })
  username: string;

  @Column({ length: 50 })
  @ApiProperty({ description: '탈퇴사유' })
  leave_reason: LeaveReason;

  @Column({ length: 1000 })
  @ApiProperty({ description: '탈퇴사유상세' })
  leave_reason_detail: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '생성일시분초' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: '수정일시분초' })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @ApiProperty({ description: '탈퇴일시분초' })
  public deletedAt: Date;

  @OneToMany(() => Point, (point) => point.user, {
    eager: true,
  })
  point?: any[];

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user, {
    eager: true,
  })
  posts?: any[];

  @OneToMany(() => Relation, (relation) => relation.user, {
    eager: true,
  })
  relations?: any[];
  friendId: number;

  static of(params: Partial<User>): User {
    const user = new User();
    Object.assign(user, params);
    return user;
  }

  static create(email: string, password: string, username: string) {
    const user = new User();
    user.email = email;
    user.password = password;
    user.username = username;
    return user;
  }

  update(password: string): void {
    this.password = password;
  }

  delete(leave_reason: LeaveReason, leave_reason_detail: string): void {
    this.leave_reason = leave_reason;
    this.leave_reason_detail = leave_reason_detail;
    this.deletedAt = new Date();
  }
}
