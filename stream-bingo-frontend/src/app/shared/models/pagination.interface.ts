export interface IPaginated<T = unknown> {
    data: T,
    meta: IPaginationMeta
}

export interface IPaginationMeta {
    currentPage: number
    itemsPerPage : number
    sortBy: Array<[string, string]>
    totalItems: number,
    totalPages: number,
}

export interface IPagination{
    page?: number
    limit?: number
    sortBy?: Array<[string, string]>
    searchBy?: Array<string>
    search?: string
    filter?: {
        [column: string]: string | Array<string>
    }
    select?: Array<string>
    cursor?: string
}
