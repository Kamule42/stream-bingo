import { IPagination,  } from "../models/pagination.interface"

export const paginationParam = (pagination?: IPagination): IPagination => pagination ?
  {
    ...pagination,
    page: (pagination.page ?? 0) + 1
  } : {
    page: 1,
    limit: 10,
  }
