export interface IValidateCodeResponse {
  access_token: string,
}

export interface ISession {
  sub: string,
  username: string,
  iat: number,
  exp: number,
  avatar: {
    id: string,
    provider: string,
  },
  rights: [{
    right: string,
    streamId?: string,
  }],
}
