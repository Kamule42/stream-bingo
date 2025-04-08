export interface IValidateCodeResponse{
    access_token: string,
}

export interface ISession{
    sub: string,
    username: string,
    iat: number,
    exp: number,
    discord: {
        id: string,
        avatarId: string,
        access_token: string,
    },
    rights: [{
        right: string,
        streamId?: string,
    }],
}
