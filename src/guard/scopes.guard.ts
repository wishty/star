import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/api/auth/auth.service';
import { UserService } from 'src/api/auth/user.service';
import { Scope } from 'src/type/scope-type';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userservice: UserService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const scopes = this.reflector.getAllAndOverride<Scope[]>('scopes', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!scopes) {
      return true;
    }
    console.log(scopes);
    const request = context.switchToHttp().getRequest();
    console.log(request);
    if (request.rawHeaders[1].startsWith('Bearer ')) {
      const user = request.user;

      return (
        user &&
        user.posts &&
        user.posts.some((scope: Scope) => scopes.includes(scope))
      );
    }

    return null;
  }
}
