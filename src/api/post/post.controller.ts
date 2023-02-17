import {
  Controller,
  HttpStatus,
  Body,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Response } from 'express';
import { PostCreateRequestDto } from './dto/post-create-request.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PostUpdateRequestDto } from './dto/post-update-request.dto';
import { PostEntity } from './post.entity';
import JwtAuthGuard from 'src/guard/jwt-auth.guard';
import RequestWithUser from 'src/secutity/request-with-user.interface';

@Controller('post')
@ApiTags('포스트 API')
export class PostController {
  constructor(private postService: PostService) {}

  @ApiOperation({
    summary: '포스트 생성 API',
    description: '포스트를 생성한다.',
  })
  @ApiCreatedResponse({ description: '포스트를 생성한다', type: Post })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @Body() requestDto: PostCreateRequestDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    requestDto.authorId = req.user.id;
    const post = await this.postService.createPost(requestDto);

    return res.status(HttpStatus.CREATED).json(post);
  }

  @ApiOperation({
    summary: '포스트 수정 API',
    description: '포스트를 수정한다.',
  })
  @ApiOkResponse({ description: '포스트를 수정한다' })
  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(
    @Body() requestDto: PostUpdateRequestDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<any | void> {
    const author: boolean = await this.postService.isAuthor(
      requestDto.id,
      req.user.id,
    );
    if (author) {
      const post = await this.postService.updatePost(requestDto);

      return res.status(HttpStatus.OK).json(post);
    }
  }

  @ApiOperation({
    summary: '포스트 삭제 API',
    description: '포스트를 삭제한다.',
  })
  @ApiOkResponse({ description: '포스트 삭제했다' })
  @UseGuards(JwtAuthGuard)
  @Post('delete/:id')
  async delete(
    @Param('id') id: number,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const author: boolean = await this.postService.isAuthor(id, req.user.id);
    if (author) {
      const post = await this.postService.deletePost(id);

      return res.status(HttpStatus.OK).json(post);
    }
  }

  @ApiOperation({
    summary: '포스트 공개범위에 따른 조회 API',
    description: '공개범위에 띠라 권한이 있는 유저만 확인 가능하도록 한다.',
  })
  @ApiOkResponse({
    description: '공개범위에 띠라 권한이 있는 유저만 확인 가능하도록 한다.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('view/:id')
  async scopeCheck(
    @Param('id') id: number,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<any> {
    const authorized: boolean = await this.postService.isAuthorized(
      id,
      req.user.id,
    );
    if (authorized) {
      const post = await this.postService.findPostById(id);
      return res.status(HttpStatus.OK).json(post);
    }
  }

  @ApiOperation({ summary: '포스트 검색 API' })
  @ApiOkResponse({ description: '포스트 검색했다' })
  @Get('search/:title')
  async search(@Param('title') title: string, @Res() res: Response) {
    const posts: PostEntity[] = await this.postService.findByPostTitle(title);

    return res.status(HttpStatus.FOUND).json(posts);
  }
}
