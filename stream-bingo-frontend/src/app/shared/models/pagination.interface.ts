export interface IPaginated<T = unknown> {
    data: T,
    meta: IPaginationMeta
}

export interface IPaginationMeta {
    currentPage: number
    itemsPerPage : number
    sortBy: [string, string][]
    totalItems: number,
    totalPages: number,
}

export interface IPagination{
    page?: number
    limit?: number
    sortBy?: [string, string][]
    searchBy?: string[]
    search?: string
    filter?: Record<string, string | string[]>
    select?: string[]
    cursor?: string
}
