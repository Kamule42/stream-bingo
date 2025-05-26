import { Injectable, Logger } from '@nestjs/common'
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
    throttleTime(1000),
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

    return this.jwtService.signAsync({
      sub: existingUser.id,
      username: existingUser.username,
      rights: existingUser.rights?.map(val => {
        return val
      })?.map(({rightKey, stream}) => ({
        right: rightKey,
        streamId: stream?.id
      })),
      providers: existingUser.providers?.map(({provider, reference, avatarReference, }) => ({
        provider,
        avatarId: provider === 'discord' ?
          reference+'/'+avatarReference :
          avatarReference,
        active: existingUser.avatarProvider === provider
      })) ?? []
    })
  }

  validateToken(token: string): ISession {
    return this.jwtService.decode(token?.replace('Bearer ', ''))
  }

  async validatePassport(data: PassportData, session: ISession): Promise<UserEntity> {
    if(session){
      return this.addProvider(data, session)
    }
    return this.validateLogin(data)
  }

  private async addProvider(data: PassportData, session: ISession): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: {id: session.sub,},
      relations: ['rights', 'rights.stream', 'providers'],
    })
    if(!user){
      throw new Error('user not found for session')
    }
    if(!user.providers.find(({provider,}) => provider == data.provider)){
      const provider = new ProviderEntity()
      provider.provider = data.provider
      provider.reference = data.id
      provider.avatarReference = data.avatar
      user.providers.push(provider)
      this.usersRepository.save(user)
    }
    return user
  }

  private async validateLogin(data: PassportData): Promise<UserEntity> {
    const id = uuid()
    const result =  await this.usersRepository.createQueryBuilder('u')
      .innerJoin(
        'u.providers', 'provider',
        'provider.provider = :provider AND provider.reference = :reference', {
          provider: data.provider,
          reference: data.id,
      })
      .leftJoinAndSelect('u.providers', 'providers')
      .leftJoinAndSelect('u.rights', 'rights')
      .leftJoinAndSelect('rights.stream', 'streams')
      .getOne() ?? 
      await this.usersRepository.save({
        id,
        username: data.username,
        avatarProvider: data.provider,
        providers: [
          {
            provider: data.provider,
            reference: data.id,
            avatarReference: data.avatar,
          }
        ]
      })
    return result
  }
  
}
