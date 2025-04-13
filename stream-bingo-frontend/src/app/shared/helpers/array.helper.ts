export const toChunk = <T>(arr: Array<T>, size: number): Array<Array<T>> => 
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    )
