export enum CheckType {
    CHECK = "check",
    CIRCLE = "circle",
    DISC = "disc",
    SCRATCH = "scratch",
    SCRIBBLE = "scribble",
    STAR = "star",
    BRUSH_CIRCLE = "brush_circle",
}

export interface ISaveParams {
    check?: CheckType
    checkColor?: string
}
