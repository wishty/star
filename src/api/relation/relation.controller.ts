import {
  Controller,
  HttpStatus,
  Body,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RelationService } from './relation.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { UserService } from '../auth/user.service';
import { RelationDto } from './dto/relation.dto';
import JwtAuthGuard from 'src/guard/jwt-auth.guard';
import RequestWithUser from 'src/secutity/request-with-user.interface';

@Controller('relation')
@ApiTags('관계 API')
export class RelationController {
  constructor(
    private relationService: RelationService,
    private userService: UserService,
  ) {}

  @ApiOperation({
    summary: '팔로우 API',
    description: '팔로우한다.',
  })
  @ApiCreatedResponse({ description: '팔로우한다' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('follow/:email')
  async follow(
    @Param('email') email: string,
    @Body() requestDto: RelationDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    requestDto.userId = req.user.id;
    requestDto.friendId = (await this.userService.findOneByEmail(email)).id;
    const relationDetail = await this.relationService.follow(requestDto);

    return res.status(HttpStatus.OK).json(relationDetail);
  }

  @ApiOperation({
    summary: '언팔로우 API',
    description: '언팔로우한다.',
  })
  @ApiCreatedResponse({ description: '언팔로우한다' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('unfollow/:email')
  async unfollow(
    @Param('email') email: string,
    @Body() requestDto: RelationDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    requestDto.userId = req.user.id;
    requestDto.friendId = (await this.userService.findOneByEmail(email)).id;
    const relationDetail = await this.relationService.unfollow(requestDto);

    return res.status(HttpStatus.OK).json(relationDetail);
  }

  @ApiOperation({
    summary: '차단 API',
    description: '차단한다.',
  })
  @ApiCreatedResponse({ description: '차단한다' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('block/:email')
  async block(
    @Param('email') email: string,
    @Body() requestDto: RelationDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    requestDto.userId = req.user.id;
    requestDto.friendId = (await this.userService.findOneByEmail(email)).id;
    console.log(requestDto);
    const relationDetail = await this.relationService.block(requestDto);

    return res.status(HttpStatus.OK).json(relationDetail);
  }

  @ApiOperation({
    summary: '차단 해제 API',
    description: '차단을 해제한다.',
  })
  @ApiCreatedResponse({ description: '차단을 해제한다' })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('nonblock/:email')
  async nonBlock(
    @Param('email') email: string,
    @Body() requestDto: RelationDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    requestDto.userId = req.user.id;
    requestDto.friendId = (await this.userService.findOneByEmail(email)).id;
    const relationDetail = await this.relationService.nonBlock(requestDto);

    return res.status(HttpStatus.OK).json(relationDetail);
  }
}
