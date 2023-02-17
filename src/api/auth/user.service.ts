import { NotFoundException, Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { User } from './user.entity';
import { UserCreateRequestDto } from './dto/user-create-request.dto';
import { isEmpty } from '../../util/shared.util';
import { UserMessage } from './user.message';
import { FindOneOptions, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { UserUpdateRequestDto } from './dto/user-update-request.dto';
import { UserDeleteRequestDto } from './dto/user-delete-request.dto';
import { PointService } from '../point/point.service';
import { SavePointDTO, UsePointDTO } from '../point/dto/point.dto';
import { Category } from 'src/type/category-type';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private pointService: PointService,
  ) {}

  /**
   * 유저를 생성한다. (가입축하 적립금을 적립한다.)
   *
   * @param {UserCreateRequestDto} requestDto
   * @returns {Promise<User>}
   */
  async save(requestDto: UserCreateRequestDto): Promise<User> {
    await this.transformPassword(requestDto);
    const user: User = await this.userRepository.save(requestDto.toEntity());
    const pointDTO = new SavePointDTO();
    pointDTO.breakdown = '가입축하 적립금';
    pointDTO.amount = 20000;
    pointDTO.userId = user.id;

    await this.pointService.save(pointDTO);
    return user;
  }

  /**
   * 유저를 검색하여 해당하는 유저 정보를 반환한다.
   *
   * @param {FindOneOptions<UserDto>} options
   * @returns {Promise<User | undefined>}
   */
  async findByFields(
    options: FindOneOptions<UserDto>,
  ): Promise<User | undefined> {
    return await this.userRepository.findOne(options);
  }

  /**
   * 유저의 비밀번호를 암호화한다.
   *
   * @param {UserCreateRequestDto | UserUpdateRequestDto} user
   * @returns {Promise<void>}
   */
  async transformPassword(
    user: UserCreateRequestDto | UserUpdateRequestDto,
  ): Promise<void> {
    user.password = await bcrypt.hash(user.password, 10);
    return Promise.resolve();
  }

  /**
   * 유저 Id에 해당하는 유저의 비밀번호를 수정한다.
   *
   * @param {UserUpdateRequestDto} requestDto
   * @returns {Promise<User>}
   */
  async updateUser(requestDto: UserUpdateRequestDto): Promise<User> {
    const user = await this.findUserById(requestDto.id);
    const { password } = requestDto;

    user.update(password);

    await this.transformPassword(user);

    return await this.userRepository.save(user);
  }

  /**
   * 이메일주소의 일부로 검색하여 해당하는 유저 정보를 반환한다.
   *
   * @param {string} email
   * @returns {Promise<User | undefined>}
   */
  async findByEmail(email: string): Promise<User[] | undefined> {
    return await this.userRepository.findBy({
      email: Like(`%${email}%`),
    });
  }

  /**
   * 이메일주소로 검색하여 해당하는 유저 정보 1건을 반환한다.
   *
   * @param {string} email
   * @returns {Promise<User | undefined>}
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user: User = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(UserMessage.NOT_FOUND_EMAIL);
    }

    return user;
  }

  /**
   * 탈퇴한다. (적립금 소멸, 탈퇴사유 반영, 소프트 삭제)
   *
   * @param {UserDeleteRequestDto} requestDto
   * @returns {Promise<User>}
   */
  async deleteUser(requestDto: UserDeleteRequestDto): Promise<User> {
    const amount: number = Number(await this.pointService.sum(requestDto.id));
    if (amount > 0) {
      const pointDTO = new UsePointDTO();
      pointDTO.category = Category.USE;
      pointDTO.amount = -amount;
      pointDTO.userId = requestDto.id;
      pointDTO.breakdown = '탈퇴로 인한 적립금 소멸';
      await this.pointService.use(pointDTO);
    }
    const user = await this.findUserById(requestDto.id);
    const { leave_reason, leave_reason_detail } = requestDto;
    user.delete(leave_reason, leave_reason_detail);
    return await this.userRepository.save(user);
  }

  /**
   * 유저 Id에 해당하는 유저 정보를 반환한다.
   *
   * @param {number} id
   * @returns {Promise<User>}
   */
  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (isEmpty(user) === true) {
      throw new NotFoundException(UserMessage.NOT_FOUND_USER);
    }

    return user;
  }
}
