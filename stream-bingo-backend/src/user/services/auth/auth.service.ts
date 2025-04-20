import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosError } from 'axios'
import { BehaviorSubject, catchError, filter, map, mergeMap, Observable, tap, throttleTime, } from 'rxjs'
import { v7 as uuid } from 'uuid'
import { UserEntity } from '../../entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ISession } from 'src/user/interfaces/session.interface'

interface ITokens {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly _newToken$$ = new BehaviorSubject<{token: string; socketId} | null>(null)
  private readonly _newToken$ = this._newToken$$.asObservable().pipe(
    filter(val => val != null),
    throttleTime(10000),
  )

  public constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  public get newToken$(){
    return this._newToken$
  }
  public set newToken(newToken: {token: string; socketId}){
    this._newToken$$.next(newToken)
  }

  public getAuthUrl(): string {
    const result = this.configService.get<string>('discord.validation_uri');
    if (!result) {
      throw new HttpException('Unknown url', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  public validateDiscord(code: string): Observable<{access_token: string, user_id: string,}> {
    const body = {
      grant_type: 'authorization_code',
      code,
      client_id: this.configService.get<string>('discord.client_id'),
      client_secret: this.configService.get<string>('discord.client_secret'),
      redirect_uri: this.configService.get<string>('discord.target_uri'),
      scopes: 'identify',
    };
    return this.httpService
      .post<ITokens>('https://discord.com/api/oauth2/token', body, {
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
        mergeMap(async (data) => {
          let existingUser = await this.usersRepository.findOne({
            where: {discordId: data.id,},
            relations: ['rights', 'rights.stream'],
          });
          existingUser ??= await this.usersRepository.save({
              id: uuid(),
              discordId: data.id,
              discordUsername: data.username,
              discordAvatar: data.avatar,
            })
          return {
            user_id: existingUser.id,
            access_token: await this.signSession(existingUser)
          }
        }),
        catchError((error: AxiosError) => {
          if (error?.response?.data) {
            this.logger.error(error?.response?.data);
          } else {
            this.logger.error(error);
          }
          throw 'An error happened!';
        }),
      );
  }

  public async signSession(param: string | UserEntity): Promise<string>{
    const existingUser = typeof param === 'string' ?
      await this.usersRepository.findOne({
        where: {id: param,},
        relations: ['rights', 'rights.stream'],
      }) :
      param;
    if(existingUser == null){
      throw new Error('unknown user')
    }
    return this.jwtService.signAsync({
      sub: existingUser.id,
      username: existingUser.discordUsername,
      discord: {
        id: existingUser.discordId,
        avatarId: existingUser.discordAvatar,
      },
      rights: existingUser.rights?.map(val => {
        return val
      })?.map(({rightKey, stream}) => ({
        right: rightKey,
        streamId: stream?.id
      }))
    })
  }

  validateToken(token: string): ISession {
    return this.jwtService.decode(token?.replace('Bearer ', ''))
  }
}
