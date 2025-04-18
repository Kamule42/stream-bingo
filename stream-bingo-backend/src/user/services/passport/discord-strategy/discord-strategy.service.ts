import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import Strategy from 'passport-discord'
import { UserEntity } from 'src/user/entities/user.entity'
import { ISession } from 'src/user/interfaces/session.interface'
import { Repository } from 'typeorm'
import { v7 as uuid } from 'uuid'

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy){

  constructor(
      @InjectRepository(UserEntity)
      private readonly usersRepository: Repository<UserEntity>,
    configService: ConfigService
  ){
    super({
      clientID: configService.get<string>('discord.client_id') ?? '',
      clientSecret: configService.get<string>('discord.client_secret') ?? '',
      callbackURL: configService.get<string>('discord.target_uri') ?? '',
      scope: ['identify']
    })
  }

  async validate(data): Promise<ISession> {
    let existingUser = await this.usersRepository.findOne({
      where: {discordId: data.id,},
      relations: ['rights', 'rights.stream'],
    }) ??  await this.usersRepository.save({
      id: uuid(),
      discordId: data.id,
      discordUsername: data.username,
      discordAvatar: data.avatar,
    })

    return {
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
    }
  }

}
