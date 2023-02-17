import {
  NotFoundException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostRepository } from './repository/post.repository';
import { PostEntity as Post } from './post.entity';
import { PostCreateRequestDto } from './dto/post-create-request.dto';
import { isEmpty } from '../../util/shared.util';
import { PostMessage } from './post.message';
import { Like } from 'typeorm';
import { PostUpdateRequestDto } from './dto/post-update-request.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { RelationService } from '../relation/relation.service';
import { Relation } from '../relation/relation.entity';
import { RelationType } from 'src/type/relation-type';
import { Scope } from 'src/type/scope-type';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly relationService: RelationService,
  ) {}

  /**
   * 포스트를 생성한다.
   *
   * @param {PostCreateRequestDto} requestDto
   * @returns {Promise<Post>}
   */
  async createPost(requestDto: PostCreateRequestDto): Promise<Post> {
    return await this.postRepository.save(requestDto);
  }

  /**
   * 포스트를 수정한다.
   *
   * @param {PostUpdateRequestDto} requestDto
   * @returns {Promise<Post>}
   */
  async updatePost(requestDto: PostUpdateRequestDto): Promise<Post> {
    const post = await this.findPostById(requestDto.id);
    const { title, content, scope, imageUrl } = requestDto;

    post.update(title, content, scope, imageUrl);

    return await this.postRepository.save(post);
  }

  /**
   * 제목으로 검색하여 해당하는 포스트를 반환한다.
   *
   * @param {string} title
   * @returns {Promise<Post | undefined>}
   */
  async findByPostTitle(title: string): Promise<Post[] | undefined> {
    return await this.postRepository.findBy({
      title: Like(`%${title}%`),
    });
  }

  /**
   * id에 해당하는 포스트 정보를 삭제한다.
   *
   * @param {number} id
   * @returns {Promise<Post>}
   */
  async deletePost(id: number): Promise<Post> {
    const post = await this.findPostById(id);

    post.delete();

    return await this.postRepository.save(post);
  }

  /**
   * id에 해당하는 포스트 정보를 조회한다.
   *
   * @param {number} id
   * @returns {Promise<PostResponseDto>}
   */
  async findById(id: number): Promise<PostResponseDto> {
    const post = await this.findPostById(id);

    return new PostResponseDto(post);
  }

  /**
   * id에 해당하는 포스트 정보를 반환한다.
   *
   * @param {number} id
   * @returns {Promise<Post>}
   * @private
   */
  async findPostById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: id },
    });

    if (isEmpty(post) === true) {
      throw new NotFoundException(PostMessage.NOT_FOUND_POST);
    }

    return post;
  }

  /**
   * id에 해당하는 포스트 정보를 조회한다.
   *
   * @param {number} id
   * @returns {Promise<Boolean>}
   */
  async isAuthorized(id: number, userId: number): Promise<boolean> {
    const post = await this.findPostById(id);
    const scope = post.scope;
    if (scope === Scope.FRIEND) {
      const relation: Relation = await this.relationService.findByFields({
        where: {
          userId: post.authorId,
          friendId: userId,
          relationName: RelationType.FOLLOW,
        },
      });

      if (post.authorId !== userId && !relation) {
        throw new UnauthorizedException();
      }
      return true;
    } else if (scope === Scope.PRIVATE) {
      if (post.authorId !== userId) {
        throw new UnauthorizedException();
      }
      return true;
    } else {
      return true;
    }
  }

  /**
   * id에 해당하는 포스트 정보를 조회한다.
   *
   * @param {number} id
   * @returns {Promise<Boolean>}
   */
  async isAuthor(id: number, userId: number): Promise<boolean> {
    const post = await this.findPostById(id);

    if (post.authorId !== userId) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
