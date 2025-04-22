export enum CheckType {
    CHECK = "check",
    CIRCLE = "circle",
    DISC = "disc",
    SCRATCH = "scratch",
    SCRIBBLE = "scribble",
    STAR = "star",
}

export interface ISaveParams {
    check?: CheckType
    checkColor?: string
}
