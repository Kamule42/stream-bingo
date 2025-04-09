import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UserService {
 public constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  findByName(name: string): Promise<Array<UserEntity>> {
    return this.usersRepository.find({
        where: {
            discordUsername: ILike(`${name}%`)
        }
    })
  }
}
