import { Reflector } from '@nestjs/core'

export const Roles = Reflector.createDecorator<Array<string | {id: string, streamKey: string}> | undefined>()
