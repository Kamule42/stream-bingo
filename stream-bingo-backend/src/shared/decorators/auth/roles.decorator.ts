import { Reflector } from '@nestjs/core'
import { IRole } from 'src/shared/interfaces/auth.interface'

export const Roles = Reflector.createDecorator<Array<IRole> | undefined>()
