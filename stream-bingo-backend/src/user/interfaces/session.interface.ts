export interface ISession{
    sub: string,
    username: string,
    discord: {
      id: string,
      avatarId: string,
      access_token: string,
      expires_in: number
    },
    rights: Array<{ right: string, streamId?: string }>,
    iat: number,
    exp: number
}
