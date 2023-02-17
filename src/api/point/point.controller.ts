import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Res,
  HttpStatus,
  Query,
  DefaultValuePipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { PointService } from './point.service';
import { Point } from './point.entity';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SavePointDTO, UseCanclePointDTO, UsePointDTO } from './dto/point.dto';
import JwtAuthGuard from 'src/guard/jwt-auth.guard';
import RequestWithUser from 'src/secutity/request-with-user.interface';

@Controller('point')
@ApiTags('포인트 API')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @ApiOperation({ summary: '회원별 포인트 내역 조회 API' })
  @ApiOkResponse({ description: '회원별 포인트 내역을 조회한다.' })
  @UseGuards(JwtAuthGuard)
  @Get('list/:category')
  async findAll(
    @Req() req: RequestWithUser,
    @Param('category') category: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Point>> {
    limit = limit > 100 ? 100 : limit;
    return this.pointService.findAll({
      userId: req.user.id,
      category,
      options: {
        page,
        limit,
        route: `http://${process.env.APP_HOST}:${process.env.APP_PORT}/point/${req.user.id}/${category}`,
      },
    });
  }

  @ApiOperation({
    summary: '포인트 적립 API',
    description: '포인트를 적립한다.',
  })
  @ApiCreatedResponse({ description: '포인트를 적립한다.' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(
    @Body() requestDto: SavePointDTO,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const point = await this.pointService.save(requestDto);
    return res.status(HttpStatus.OK).json(point);
  }

  @ApiOperation({
    summary: '포인트 사용 API',
    description: '포인트를 사용한다.',
  })
  @ApiCreatedResponse({ description: '포인트를 사용한다.' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('use')
  async use(
    @Body() requestDto: UsePointDTO,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const point = await this.pointService.use(requestDto);
    return res.status(HttpStatus.OK).json(point);
  }

  @ApiOperation({
    summary: '포인트 사용 취소 API',
    description: '포인트 사용을 취소한다.',
  })
  @ApiCreatedResponse({ description: '포인트 사용을 취소한다.' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('cancle')
  async useCancle(
    @Body() requestDto: UseCanclePointDTO,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const point = await this.pointService.useCancle(requestDto);
    return res.status(HttpStatus.OK).json(point);
  }

  @ApiOperation({ summary: '포인트 합계 조회 API' })
  @ApiOkResponse({
    description: '회원별 적립금 합계를 조회한다.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('sum')
  async findSum(@Req() req: RequestWithUser, @Res() res: Response) {
    const sum: number = Number(await this.pointService.sum(req.user.id));
    return res.status(HttpStatus.OK).json(sum);
  }
}
