import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavePointDTO, UsePointDTO, UseCanclePointDTO } from './dto/point.dto';
import { PointUseDTO } from './dto/point-use.dto';
import { PointRepository } from './point.repository';
import { Connection } from 'typeorm';
import { PointUserepository } from './point-use.repository';
import { Point } from './point.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { Category } from 'src/type/category-type';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(PointRepository)
    private pointRepository: PointRepository,
    @InjectRepository(PointUserepository)
    private pointUserepository: PointUserepository,
    private connection: Connection,
  ) {}

  /**
   * 포인트를 적립한다.
   *
   * @param {SavePointDTO} pointDTO - 포인트 저장 Dto
   * @returns {Promise<any>}
   */
  async save(pointDTO: SavePointDTO): Promise<any> {
    return await this.pointRepository.save(pointDTO);
  }

  /**
   * 포인트를 사용한다.
   *
   * @param {UsePointDTO} pointDTO - 포인트 사용 Dto
   * @returns {Promise<any>}
   */
  async use(pointDTO: UsePointDTO): Promise<any> {
    const userId = Number(pointDTO.userId);
    let amount = Number(pointDTO.amount);

    const afterUseAmout: number = Number(await this.sum(userId)) + amount;
    if (afterUseAmout < 0) {
      throw new HttpException(
        '적립금은 마이너스가 될 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const unusedPoints = await this.pointRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.uses', 'point_use')
      .where(
        "point.user_id = :userId AND point.expirationDate >= DATE_FORMAT(NOW(), '%Y-%m-%d')",
        {
          userId,
        },
      )
      .select('point.id')
      .addSelect('point.amount - IFNULL(SUM(point_use.amount),0)', 'balance')
      .groupBy('point.id')
      .having('balance > 0')
      .orderBy('point.created_at', 'ASC')
      .getRawMany();

    // transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const pointId = (
        await this.pointRepository.save({
          ...pointDTO,
          category: Category.USE,
          expirationDate: '9999-12-31',
        })
      ).id;

      unusedPoints.forEach((point) => {
        const poinUsetDTO: PointUseDTO = new PointUseDTO();
        const balance = Number(point.balance);
        if (amount === 0) return;

        if (-amount <= balance) {
          poinUsetDTO.amount = amount;
          amount = 0;
        } else {
          poinUsetDTO.amount = -balance;
          amount += balance;
        }
        poinUsetDTO.pointId = point.point_id;
        poinUsetDTO.pointIdUse = pointId;
        this.pointUserepository.save(poinUsetDTO);
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 포인트 사용을 취소한다.
   *
   * @param {UsePointDTO} pointDTO - 포인트 사용취소 Dto
   * @returns {Promise<any>}
   */
  async useCancle(pointDTO: UseCanclePointDTO): Promise<any> {
    const pointIdUse = Number(pointDTO.id);
    const userId = Number(pointDTO.userId);

    const usedPoints = await this.pointUserepository
      .createQueryBuilder('point_use')
      .where('point_use.point_id_use = :pointIdUse', {
        pointIdUse,
      })
      .select('point_use.id')
      .addSelect('point_use.amount', 'amount')
      .addSelect('point_use.point_id', 'point_id')
      .having('amount < 0')
      .orderBy('point_use.created_at', 'ASC')
      .getRawMany();

    // transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const pointIdUse = (
        await this.pointRepository.save({
          category: pointDTO.category,
          breakdown: pointDTO.breakdown,
          amount: pointDTO.amount,
          userId: userId,
          expirationDate: '9999-12-31',
        })
      ).id;

      usedPoints.forEach((usedPoint) => {
        const poinUsetDTO: PointUseDTO = new PointUseDTO();
        poinUsetDTO.amount = -usedPoint.amount;
        poinUsetDTO.pointIdUse = pointIdUse;
        poinUsetDTO.pointId = usedPoint.point_id;
        this.pointUserepository.save(poinUsetDTO);
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 회원별 포인트 잔액을 조회한다.
   *
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async sum(userId: number): Promise<number> {
    const { sum } = await this.pointRepository
      .createQueryBuilder('point')
      .where(
        "point.user_id = :userId AND point.expirationDate >= DATE_FORMAT(NOW(), '%Y-%m-%d')",
        {
          userId,
        },
      )
      .select('SUM(point.amount)', 'sum')
      .getRawOne();
    return sum;
  }

  /**
   * 회원별 포인트 내역을 조회한다.
   *
   * @returns {Promise<Pagination<Point>>}
   */
  async findAll({
    userId,
    category,
    options,
  }: {
    userId: number;
    category: string;
    options: IPaginationOptions;
  }): Promise<Pagination<Point>> {
    const list = this.pointRepository
      .createQueryBuilder('point')
      .where('point.userId = :userId AND point.category = :category', {
        userId,
        category,
      })
      .orderBy('point.created_at', 'DESC');
    return paginate<Point>(list, options);
  }
}
