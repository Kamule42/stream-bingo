import { WsResponse } from "@nestjs/websockets"

export type IPaginatedResponse<T = any> = WsResponse<{
    data: Array<T>
    meta: IPaginationMeta
}>

export interface IPaginationMeta {
    itemsPerPage : number
    totalItems?: number
    currentPage?: number
    sortBy: Array<[string, string]>
    totalPages?: number
}