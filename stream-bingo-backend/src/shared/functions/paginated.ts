import { Paginated } from "nestjs-paginate"
import { IPaginationMeta } from "../interfaces/paginated.interface"


export function toPaginationMeta<T = any>(dbMeta:  Paginated<T>['meta']): IPaginationMeta{
    return {
        currentPage: dbMeta.currentPage,
        itemsPerPage: dbMeta.itemsPerPage,
        sortBy: dbMeta.sortBy,
        totalItems: dbMeta.totalItems,
        totalPages: dbMeta.totalPages,
    }
}
