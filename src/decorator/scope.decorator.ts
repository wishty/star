import { SetMetadata } from '@nestjs/common';
import { Scope } from './../type/scope-type';

export const Scopes = (...scopes: Scope[]) => SetMetadata('scopes', scopes);
