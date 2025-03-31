import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  public constructor(private configService: ConfigService) {}

  public auth(): void {
    this.configService.get<string>('discord');
  }
}
