import { SetMetadata } from '@nestjs/common';
import { Role } from '../type/role-type';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
