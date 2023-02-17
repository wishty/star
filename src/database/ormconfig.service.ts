import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '../config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('DB_TYPE') as any,
      host: this.configService.isEnv('development')
        ? this.configService.get('DB_HOST')
        : 'localhost',
      port: parseInt(this.configService.get('DB_PORT')) || 3306,
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging:
        this.configService.isEnv('development') ||
        this.configService.isEnv('localhost'),
    };
  }
}
