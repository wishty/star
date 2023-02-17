import {
  BadRequestException,
  Injectable,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserCreateRequestDto } from './dto/user-create-request.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDeleteRequestDto } from './dto/user-delete-request.dto';
import { UserUpdateRequestDto } from './dto/user-update-request.dto';
import { UserMessage } from './user.message';
import { TokenPayload } from 'src/secutity/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import JwtAuthGuard from 'src/guard/jwt-auth.guard';
import RequestWithUser from 'src/secutity/request-with-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 유저를 생성한다.
   *
   * @param {UserCreateRequestDto} requestDto
   * @returns {Promise<User>}
   */
  async createUser(requestDto: UserCreateRequestDto): Promise<User> {
    const foundUser: User = await this.userService.findByFields({
      where: { email: requestDto.email },
    });
    if (foundUser) {
      throw new BadRequestException(UserMessage.USED_EMAIL);
    }
    return this.userService.save(requestDto);
  }

  /**
   * 로그인을 위해 사용자 검증을 한다.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<any>}
   */
  async vailidateUser(email: string, password: string): Promise<any> {
    try {
      const foundUser: User = await this.userService.findOneByEmail(email);
      await this.vailidatePassword(password, foundUser.password);

      foundUser.password = undefined;
      return foundUser;
    } catch (err) {
      throw new BadRequestException(UserMessage.BAD_AUTH_REQUEST);
    }
  }

  /**
   * 패스워드를 검증한다.
   *
   * @param {string} plainTextPassword
   * @param {string} hashedPassword
   * @returns {Promise<any>}
   */
  async vailidatePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<any> {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException(UserMessage.BAD_AUTH_REQUEST);
    }
  }

  /**
   * jwt 토큰을 이용하여 쿠키를 생성한다.
   *
   * @param {number} id
   * @returns {Promise<string>}
   */
  async getCookieWithJwtToken(id: number): Promise<string> {
    const payload: TokenPayload = { id };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=300`;
  }

  /**
   * 로그아웃을 하기 위한 쿠키를 생성한다.
   *
   * @returns {Promise<string>}
   */
  async getCookieForLogOut(): Promise<string> {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  /**
   * jwt를 통해 토큰을 검증한다.
   *
   * @param {string} token
   * @returns {Promise<any>}
   */
  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }

  /**
   * 유저의 비밀번호를 변경한다.
   *
   * @param {UserUpdateRequestDto} requestDto
   * @returns {Promise<User>}
   */
  async changeUserPassword(requestDto: UserUpdateRequestDto): Promise<User> {
    const foundUser: User = await this.userService.findUserById(requestDto.id);
    const validatePassword = await bcrypt.compare(
      requestDto.password,
      foundUser.password,
    );
    if (validatePassword) {
      throw new BadRequestException(UserMessage.SAME_PREV_PASSWORD);
    }
    return this.userService.updateUser(requestDto);
  }

  /**
   * 이메일주소로 검색하여 해당하는 유저 정보를 반환한다.
   *
   * @param {string} email
   * @returns {Promise<User | undefined>}
   * @private
   */
  async findByUserEmail(email: string): Promise<User[] | undefined> {
    return this.userService.findByEmail(email);
  }

  /**
   * 유저를 삭제한다.
   *
   * @param {UserDeleteRequestDto} requestDto
   * @returns {Promise<User>}
   */
  async deleteUser(requestDto: UserDeleteRequestDto): Promise<User> {
    return this.userService.deleteUser(requestDto);
  }

  /**
   * 토큰이 유효한지 확인한다.
   *
   * @param {TokenPayload} payload
   * @returns {Promise<User | undefined>}
   */
  async tokenValidateUser(payload: TokenPayload): Promise<User | undefined> {
    const foundUser = await this.userService.findUserById(payload.id);
    return foundUser;
  }

  /**
   * 쿠키를 통해 회원 정보를 조회한다.
   *
   * @param {RequestWithUser} req
   * @returns {User}
   */
  @UseGuards(JwtAuthGuard)
  authenticate(@Req() req: RequestWithUser): User {
    const user: User = req.user;
    user.password = undefined;
    return user;
  }
}
