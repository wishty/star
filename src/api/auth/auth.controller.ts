import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UserCreateRequestDto } from './dto/user-create-request.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { UserDeleteRequestDto } from './dto/user-delete-request.dto';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';
import RequestWithUser from 'src/secutity/request-with-user.interface';
import JwtAuthGuard from 'src/guard/jwt-auth.guard';

@Controller('auth')
@ApiTags('권한 API')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '회원 가입 API',
    description: '회원 가입을 한다.',
  })
  @ApiCreatedResponse({ description: '회원을 생성한다.', type: User })
  @UsePipes(ValidationPipe)
  async registerAccount(
    @Body() requestDto: UserCreateRequestDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.createUser(requestDto);

    return res.status(HttpStatus.CREATED).json(user);
  }

  @ApiOperation({
    summary: '회원 로그인 API',
    description: '로그인을 한다.',
  })
  @ApiOkResponse({ description: '로그인에 성공하였다.' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginAccount(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<any> {
    const { user } = req;
    const cookie = await this.authService.getCookieWithJwtToken(user.id);
    res.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return res.send(user);
  }

  @ApiOperation({
    summary: '회원 비밀번호 변경 API',
    description: '회원 비밀번호를 변경한다.',
  })
  @ApiOkResponse({ description: '회원 비밀번호 변경에 성공하였다.' })
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() dto: any,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const { user } = req;
    dto['id'] = user.id;
    const updatedUser = await this.authService.changeUserPassword(dto);

    return res.status(HttpStatus.OK).json(updatedUser);
  }

  @Get('search/:email')
  @ApiOperation({ summary: '회원 검색 API' })
  @ApiOkResponse({ description: '회원 검색에 성공하였다.' })
  async search(@Param('email') email: string, @Res() res: Response) {
    const users: User[] = await this.authService.findByUserEmail(email);

    return res.status(HttpStatus.FOUND).json(users);
  }

  @ApiOperation({
    summary: '회원 탈퇴 API',
    description: '탈퇴한다',
  })
  @ApiOkResponse({ description: '탈퇴한다' })
  @UseGuards(JwtAuthGuard)
  @Post('leave')
  async unregisterAccount(
    @Body() requestDto: UserDeleteRequestDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const { user } = req;
    const deletedUser = await this.authService.deleteUser({
      ...requestDto,
      id: user.id,
    });

    return res.status(HttpStatus.OK).json(deletedUser);
  }

  @Get('authenticate')
  @ApiOperation({
    summary: '회원 토큰 확인 API',
    description: '회원 토큰을 확인한다.',
  })
  @ApiOkResponse({ description: '회원 토큰을 확인한다.' })
  @UseGuards(JwtAuthGuard)
  authenticate(@Req() req: RequestWithUser): User {
    const { user } = req;
    user.password = undefined;
    return user;
  }

  @ApiOperation({
    summary: '로그아웃 API',
    description: '쿠키를 초기화 한다.',
  })
  @ApiOkResponse({ description: '쿠키를 초기화 한다.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response): Promise<any> {
    res.setHeader('Set-Cookie', await this.authService.getCookieForLogOut());
    return res.status(HttpStatus.OK).send({ message: 'logout success' });
  }
}
