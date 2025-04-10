export interface IPaginatedResponse<T = any>{
    data: Array<T>
    meta: IPaginationMeta
}

export interface IPaginationMeta {
    itemsPerPage : number
    totalItems?: number
    currentPage?: number
    sortBy: Array<[string, string]>
    totalPages?: number
}