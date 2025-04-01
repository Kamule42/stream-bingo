import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, map, mergeMap, Observable, tap } from 'rxjs';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public getAuthUrl(): string {
    const result = this.configService.get<string>('discord.redirect_uri');
    if (!result) {
      throw new HttpException('Unknown url', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  public validateDiscord(code: string): Observable<void> {
    this.logger.log(code);
    const body = {
      grant_type: 'authorization_code',
      code,
      // redirect_uri: this.configService.get<string>('base_url'),
      client_id: this.configService.get<string>('discord.client_id'),
      client_secret: this.configService.get<string>('discord.client_secret'),
      redirect_uri: 'http://localhost:4200/api/auth/redirect/discord',
      scopes: 'identify',
    };
    return this.httpService
      .post<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
        token_type: string;
      }>('https://discord.com/api/oauth2/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        map(({ data }) => data),
        mergeMap((token) =>
          this.httpService
            .get<{ id: string; username: string; avatar: string }>(
              'https://discord.com/api/users/@me',
              {
                headers: {
                  Authorization: `${token.token_type} ${token.access_token}`,
                },
              },
            )
            .pipe(
              map(({ data }) => ({
                ...token,
                id: data.id,
                username: data.username,
                avatar: data.avatar,
              })),
            ),
        ),
        mergeMap((data) =>
          this.usersRepository.findOneBy({ discordId: data.id }),
        ),
        tap((v) => this.logger.log(v)),
        //
        map(() => void 0),
        catchError((error: AxiosError) => {
          this.logger.error(error?.response?.data);
          throw 'An error happened!';
        }),
      );
  }
}
