import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PostEntity as Post } from './../post.entity';

export class PostResponseDto {
  @Exclude() private readonly _title: string;
  @Exclude() private readonly _content: string;
  @Exclude() private readonly _scope: string;
  @Exclude() private readonly _imageUrl: string;
  @Exclude() private readonly _authorId: number;

  constructor(post: Post) {
    this._title = post.title;
    this._content = post.content;
    this._scope = post.scope;
    this._imageUrl = post.imageUrl;
    this._authorId = post.authorId;
  }

  @ApiProperty({ description: '제목' })
  @Expose()
  get title(): string {
    return this._title;
  }

  @ApiProperty({ description: '내용' })
  @Expose()
  get content(): string {
    return this._content;
  }

  @ApiProperty({ description: '공개범위' })
  @Expose()
  get scope(): string {
    return this._scope;
  }

  @ApiProperty({ description: '이미지 주소' })
  @Expose()
  get imageUrl(): string {
    return this._imageUrl;
  }

  @ApiProperty({ description: '작성자ID' })
  get authorId(): number {
    return this._authorId;
  }
}
