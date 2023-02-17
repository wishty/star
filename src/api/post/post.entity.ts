import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Scope } from './../../type/scope-type';
import { User } from '../auth/user.entity';

@Entity('post')
export class PostEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ length: 100 })
  @ApiProperty({ description: '제목' })
  title: string;

  @Column()
  @ApiProperty({ description: '내용' })
  content: string;

  @Column()
  @ApiProperty({ description: '공개범위' })
  scope: Scope;

  @Column({ name: 'image_url', length: 1000 })
  @ApiProperty({ description: '이미지 주소' })
  imageUrl: string;

  @Column({ name: 'author_id' })
  @ApiProperty({ description: '작성자ID' })
  authorId: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '생성일시분초' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: '수정일시분초' })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @ApiProperty({ description: '삭제일시분초' })
  public deletedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'author_id' })
  user: User;

  static of(params: Partial<PostEntity>): PostEntity {
    const postEntity = new PostEntity();
    Object.assign(postEntity, params);

    return postEntity;
  }

  static create(
    title: string,
    content: string,
    scope: Scope,
    imageUrl: string,
    authorId: number,
  ) {
    const postEntity = new PostEntity();
    postEntity.title = title;
    postEntity.content = content;
    postEntity.scope = scope;
    postEntity.imageUrl = imageUrl;
    postEntity.authorId = authorId;

    return postEntity;
  }

  update(title: string, content: string, scope: Scope, imageUrl: string): void {
    this.title = title;
    this.content = content;
    this.scope = scope;
    this.imageUrl = imageUrl;
  }

  delete(): void {
    this.deletedAt = new Date();
  }
}
