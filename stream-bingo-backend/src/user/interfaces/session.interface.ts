export interface ISession{
    sub: string,
    username: string,
    discord: {
      id: string,
      avatarId: string,
    },
    rights: Array<{ right: string, streamId?: string }>,
    iat?: number,
    exp?: number
}
