import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Socket } from 'socket.io'
import { ISession } from 'src/user/interfaces/session.interface'
import { FastifyRequest } from 'fastify'

const extractToken = (request) => {
  const requestType = request?.constructor?.name
  switch(requestType){
    case 'Socket': {
      const client = request as Socket
      return client.handshake.auth.token?.substring(7)
    }
    case 'FastifyRequest': {
      const req = request as FastifyRequest
      return req.headers.authorization?.substring(7)
    }
    default: 
      return null
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractToken]),
      ignoreExpiration: true,
      secretOrKey: configService.get('jwt.secret') ?? 'secret',

    });
  }

  async validate(payload: ISession) {
    return payload;
  }
}