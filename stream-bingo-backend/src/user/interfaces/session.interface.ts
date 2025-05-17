export interface ISession{
    sub: string,
    username: string,
    avatar:{
      provider: string,
      id: string,
    }
    rights: Array<{ right: string, streamId?: string }>,
    iat?: number,
    exp?: number
}
