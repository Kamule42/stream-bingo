export interface IValidateCodeResponse{
    access_token: string,
}

export interface ISession{
    sub: string,
    username: string,
    discord: {
        id: string,
        avatarId: string,
        access_token: string,
    }
}