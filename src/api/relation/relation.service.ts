import {
  NotFoundException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RelationRepository } from './repository/relation.repository';
import { Relation as Relation } from './relation.entity';
import { isEmpty } from '../../util/shared.util';
import { RelationMessage } from './relation.message';
import { FindOneOptions } from 'typeorm';
import { RelationDetailRepository } from './repository/relation-detail.repository';
import { RelationDetail } from './relation-detail.entity';
import { RelationType } from 'src/type/relation-type';
import { RelationDetailDto } from './dto/relation-detail.dto';
import { RelationDto } from './dto/relation.dto';

@Injectable()
export class RelationService {
  constructor(
    private readonly relationRepository: RelationRepository,
    private readonly relationDetailRepository: RelationDetailRepository,
  ) {}

  /**
   * 팔로우한다.
   *
   * @param {RelationCreateRequestDto} requestDto
   * @returns {Promise<RelationDetail>}
   */
  async follow(requestDto: RelationDto): Promise<RelationDetail> {
    if (!requestDto.friendId) {
      throw new NotFoundException(RelationMessage.NOT_FOUND_USER);
    }

    // 팔로우 하기 전에 상대방이 나를 차단하고 있지 않은지 확인한다.
    const relationBlocked: Relation = await this.findByFields({
      where: {
        userId: requestDto.friendId,
        friendId: requestDto.userId,
        relationName: RelationType.BLOCKED,
      },
    });

    if (relationBlocked) {
      throw new UnauthorizedException(RelationMessage.UNAUTHORIZATION_RELATION);
    }

    // 내가 상대방을 팔로우 또는 차단 하고 있는지 확인한다.
    const relationMine: Relation = await this.findByFields({
      where: {
        userId: requestDto.userId,
        friendId: requestDto.friendId,
      },
    });

    // 팔로우 상태이면 에러를 throw하고, 차단상태이면 차단을 해제한다.
    if (relationMine && relationMine.relationName === RelationType.FOLLOW) {
      throw new NotFoundException(RelationMessage.FOLLOW_RELATION);
    } else if (
      relationMine &&
      relationMine.relationName === RelationType.BLOCKED
    ) {
      this.nonBlock(relationMine);
    } else {
      const requestDetailDto = new RelationDetailDto();
      requestDetailDto.relationName = RelationType.FOLLOW;
      requestDto.relationName = RelationType.FOLLOW;
      requestDetailDto.relationId = (await this.createRelation(requestDto)).id;
      return await this.createRelationDetail(requestDetailDto);
    }
  }

  /**
   * 언팔로우한다.
   *
   * @param {RelationDto} requestDto
   * @returns {Promise<RelationDetail>}
   */
  async unfollow(requestDto: RelationDto): Promise<RelationDetail> {
    if (!requestDto.friendId) {
      throw new NotFoundException(RelationMessage.NOT_FOUND_USER);
    }

    // 관계 정보를 확인한다.
    const relation: Relation = await this.findByFields({
      where: {
        userId: requestDto.userId,
        friendId: requestDto.friendId,
      },
    });
    const { relationName } = await this.findRelationById(relation.id);
    if (relationName !== RelationType.FOLLOW) {
      throw new NotFoundException(RelationMessage.NOT_FOLLOW_RELATION);
    }
    const requestDetailDto = new RelationDetailDto();
    requestDetailDto.relationName = RelationType.UNFOLLOW;
    requestDetailDto.relationId = (await this.deleteRelation(relation.id)).id;
    return await this.createRelationDetail(requestDetailDto);
  }

  /**
   * 차단한다.
   *
   * @param {RelationDto} requestDto
   * @returns {Promise<RelationDetail>}
   */
  async block(requestDto: RelationDto): Promise<RelationDetail> {
    if (!requestDto.friendId) {
      throw new NotFoundException(RelationMessage.NOT_FOUND_USER);
    }

    // 내가 상대방을 팔로우 하고 있는지 확인한다.
    const relationMine: Relation = await this.findByFields({
      where: {
        userId: requestDto.userId,
        friendId: requestDto.friendId,
        relationName: RelationType.FOLLOW,
      },
    });

    if (!relationMine) {
      throw new NotFoundException(RelationMessage.NOT_FOLLOW_RELATION);
    }

    // 상대방이 나를 팔로우 하고 있으면 언팔로우 시킨다.
    const relationFriend: Relation = await this.findByFields({
      where: {
        userId: requestDto.friendId,
        friendId: requestDto.userId,
        relationName: RelationType.FOLLOW,
      },
    });

    if (relationFriend) {
      this.unfollow(relationFriend);
    }
    requestDto.id = relationMine.id;
    //requestDto.friendId = relationMine.friendId;
    requestDto.relationName = RelationType.BLOCKED;
    console.log(requestDto);
    const requestDetailDto = new RelationDetailDto();
    requestDetailDto.relationName = RelationType.BLOCKED;
    requestDetailDto.relationId = (await this.updateRelation(requestDto)).id;
    return await this.createRelationDetail(requestDetailDto);
  }

  /**
   * 차단을 해제한다.
   *
   * @param {RelationDto} requestDto
   * @returns {Promise<RelationDetail>}
   */
  async nonBlock(requestDto: RelationDto): Promise<RelationDetail> {
    if (!requestDto.friendId) {
      throw new NotFoundException(RelationMessage.NOT_FOUND_USER);
    }

    // 내가 상대방을 차단하고 있는지 확인한다.
    const relation: Relation = await this.findByFields({
      where: {
        userId: requestDto.userId,
        friendId: requestDto.friendId,
        relationName: RelationType.BLOCKED,
      },
    });

    if (!relation) {
      throw new NotFoundException(RelationMessage.NOT_BLOCKED_RELATION);
    }

    const requestDetailDto = new RelationDetailDto();
    requestDetailDto.relationName = RelationType.NON_BLOCKED;
    requestDetailDto.relationId = (await this.deleteRelation(relation.id)).id;
    return await this.createRelationDetail(requestDetailDto);
  }

  /**
   * 관계를 검색하여 해당하는 관계 정보를 반환한다.
   *
   * @param {FindOneOptions<Relation>} options
   * @returns {Promise<Relation | undefined>}
   */
  async findByFields(
    options: FindOneOptions<Relation>,
  ): Promise<Relation | undefined> {
    return await this.relationRepository.findOne(options);
  }

  /**
   * id에 해당하는 관계 정보를 삭제한다.
   *
   * @param {number} id
   * @returns {Promise<Relation>}
   */
  async deleteRelation(id: number): Promise<Relation> {
    const relation = await this.findRelationById(id);

    relation.delete();

    return await this.relationRepository.save(relation);
  }

  /**
   * 관계를 생성한다.
   *
   * @param {RelationDto} requestDto
   * @returns {Promise<Relation>}
   */
  async createRelation(requestDto: RelationDto): Promise<Relation> {
    return await this.relationRepository.save(requestDto);
  }

  /**
   * 관계 상세를 생성한다.
   *
   * @param {RelationDetailCreateRequestDto} requestDto
   * @returns {Promise<Relation>}
   */
  async createRelationDetail(
    requestDto: RelationDetailDto,
  ): Promise<RelationDetail> {
    return await this.relationDetailRepository.save(requestDto);
  }

  /**
   * 관계를 수정한다.
   *
   * @param {RelationDto} requestDto
   * @returns {Promise<Relation>}
   */
  async updateRelation(requestDto: RelationDto): Promise<Relation> {
    const relation = await this.findRelationById(requestDto.id);
    const { relationName } = requestDto;

    relation.update(relationName);

    return await this.relationRepository.save(relation);
  }

  /**
   * id에 해당하는 관계 정보를 반환한다.
   *
   * @param {number} id
   * @returns {Promise<Relation>}
   * @private
   */
  private async findRelationById(id: number): Promise<Relation> {
    const relation = await this.relationRepository.findOne({
      where: { id: id },
    });

    if (isEmpty(relation) === true) {
      throw new NotFoundException(RelationMessage.NOT_FOUND_RELATION);
    }

    return relation;
  }
}
