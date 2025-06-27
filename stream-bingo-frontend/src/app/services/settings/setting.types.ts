export enum CheckType {
    CHECK = "check",
    CIRCLE = "circle",
    DISC = "disc",
    SCRATCH = "scratch",
    SCRIBBLE = "scribble",
    STAR = "star",
    BRUSH_CIRCLE = "brush_circle",
    DAISY = "daisy",
}

export enum BingoMode {
    AUTO_COMPLETE = "auto_complete",
    MANUAL = "manual",
}

export interface ISaveParams {
    check?: CheckType
    checkColor?: string
    stripeColor?: string
    bingoMode?: BingoMode
    showBingoResults?: boolean
}
