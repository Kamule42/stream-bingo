import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { StreamEntity } from 'src/stream/entities/stream.entity'
import { UserEntity } from 'src/user/entities/user.entity'
import { DeleteResult, ILike, Repository } from 'typeorm'
@Injectable()
export class UserService {
 public constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  findByName(name: string): Promise<Array<UserEntity>> {
    return this.usersRepository.find({
      where: {
          username: ILike(`${name}%`)
      }
    })
  }
  async flipFav(userId: string, streamId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: {id: userId},
      relations: ['favs'],
    })
    if(!user){
      throw new Error('User not found')
    }
    const hasFav = user.favs.some(({id}) => id === streamId)
    if(hasFav){
      user.favs = user.favs.filter(({id}) => id !== streamId)
    }
    else{
      user.favs.push({ id: streamId } as StreamEntity)
    }
    this.usersRepository.save(user)
    return user
  }

  deleteUser(id: string) : Promise<DeleteResult>{
    return this.usersRepository.delete({ id })
  }
}
