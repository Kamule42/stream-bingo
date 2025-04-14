export enum CheckType {
    CHECK = "check",
    CIRCLE = "circle",
    DISC = "disc",
    SCRATCH = "scratch",
}

export interface ISaveParams {
    check?: CheckType
    checkColor?: string
}