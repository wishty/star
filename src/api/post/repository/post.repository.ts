import { Repository } from 'typeorm';
import { PostEntity as Post } from './../post.entity';
import { CustomRepository } from '../../../decorator/typeorm-ex.decorator';

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {}
