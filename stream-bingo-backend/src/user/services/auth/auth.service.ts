import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BehaviorSubject, filter, throttleTime, } from 'rxjs'
import { v7 as uuid } from 'uuid'
import { UserEntity } from '../../entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ISession } from 'src/user/interfaces/session.interface'
import { PassportData } from 'src/user/interfaces/passport-data.interface'
import { ProviderEntity } from 'src/user/entities/provider.entity'

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

  public async signSession(param: string | UserEntity): Promise<string>{
    const existingUser = typeof param === 'string' ?
      await this.usersRepository.findOne({
        where: {id: param,},
        relations: ['rights', 'rights.stream', 'providers'],
      }) :
      param;
    if(existingUser == null){
      throw new Error('unknown user')
    }
    const avatarProvider = existingUser.providers?.find(({provider}) => provider == existingUser.avatarProvider) ?? existingUser.providers?.at(0)
    const avatar = this.avatar(avatarProvider)

    return this.jwtService.signAsync({
      sub: existingUser.id,
      username: existingUser.username,
      avatar,
      rights: existingUser.rights?.map(val => {
        return val
      })?.map(({rightKey, stream}) => ({
        right: rightKey,
        streamId: stream?.id
      }))
    })
  }

  private avatar(avatarProvider: ProviderEntity | undefined){
    console.log(avatarProvider)
    if(!avatarProvider){
      return {provider: 'none', id: 'none'}
    }
    switch(avatarProvider.provider){
      case 'discord': return {
        provider: avatarProvider.provider,
        id: avatarProvider.reference+'/'+avatarProvider.avatarReference
      }
    }
    return {
      provider: avatarProvider.provider,
      id: avatarProvider.avatarReference,
    }
  }

  validateToken(token: string): ISession {
    return this.jwtService.decode(token?.replace('Bearer ', ''))
  }

  async validatePassport(provider: string, data: PassportData): Promise<ISession> {
    let existingUser = await this.usersRepository.findOne({
      where: {providers: { provider, reference: data.id, },},
      relations: ['rights', 'rights.stream', 'providers'],
    }) ??  await this.usersRepository.save({
      id: uuid(),
      username: data.username,
      avatarProvider: provider,
      providers: [
        {
          provider,
          reference: data.id,
          avatarReference: data.avatar
        }
      ]
    })
    const avatarProvider = existingUser.providers?.find(({provider}) => provider == existingUser.avatarProvider) ?? existingUser.providers.at(0)
    const avatar = this.avatar(avatarProvider)
    return {
      sub: existingUser.id,
      username: existingUser.username,
      avatar,
      rights: existingUser.rights?.map(val => {
        return val
      })?.map(({rightKey, stream}) => ({
        right: rightKey,
        streamId: stream?.id
      }))
    }
  }
}
