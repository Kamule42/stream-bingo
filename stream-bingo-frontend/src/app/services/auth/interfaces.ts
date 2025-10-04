export interface IValidateCodeResponse {
  access_token: string,
}

export interface ISession {
  sub: string
  username: string
  iat: number
  exp: number
  rights: [{
    right: string
    streamId?: string
  }],
  providers: [{
    provider: string
    avatarId: string
    active: boolean
  }]
  sessionExpires?: number
}
